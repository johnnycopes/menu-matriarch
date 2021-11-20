import { Injectable } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';

import { DishDbo } from '@models/dbos/dish-dbo.interface';
import { MenuDbo } from '@models/dbos/menu-dbo.interface';
import { TagDbo } from '@models/dbos/tag-dbo.interface';
import { Dish } from '@models/interfaces/dish.interface';
import { Tag } from '@models/interfaces/tag.interface';
import { DocRefService } from './doc-ref.service';
import { FirestoreService } from './firestore.service';
import { Menu } from '@models/interfaces/menu.interface';
import { Day } from '@models/types/day.type';

@Injectable({
  providedIn: 'root'
})
export class BatchService {

  constructor(
    private _firestoreService: FirestoreService,
    private _docRefService: DocRefService,
  ) { }

  public async updateMenuContents({
    menu, dishId, day, selected
  }: {
    menu: Menu,
    dishId: string,
    day: Day,
    selected: boolean,
  }): Promise<void> {
    const batch = this._firestoreService.getBatch();
    const dishCount = this._countDishes(menu)[dishId] ?? 0;
    let menusChange = 0;
    if (dishCount === 0 && selected) {
      menusChange = 1;
    } else if (dishCount === 1 && !selected) {
      menusChange = -1;
    }
    batch.update(this._docRefService.getDish(dishId),
      this._getDishUpdates({
        menuId: menu.id,
        daysChange: selected ? 1 : -1,
        menusChange,
      })
    );
    batch.update(this._docRefService.getMenu(menu.id),
      this._getMenuDayUpdates({
        day,
        dishes: selected
          ? this._firestoreService.addToArray(dishId)
          : this._firestoreService.removeFromArray(dishId)
      })
    );
    await batch.commit();
  }

  public async updateDish(dish: Dish, updates: Partial<Omit<DishDbo, 'usages' | 'menus'>>) {
    const batch = this._firestoreService.getBatch();
    batch.update(this._docRefService.getDish(dish.id), updates);
    if (updates.tags) {
      this._getTagsUpdates(dish, updates.tags).forEach(
        ({ docRef, dishes }) => batch.update(docRef, { dishes })
      );
    }
    await batch.commit();
  }

  public async deleteMenu(menu: MenuDbo): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._docRefService.getMenu(menu.id));
    this._getDishesUpdates(menu).forEach(
      ({ docRef, usages, menus }) => batch.update(docRef, {
        usages,
        ...(menus && { menus }),
      })
    );
    await batch.commit();
  }

  public async deleteMenuContents(menu: Menu, day?: Day) {
    const batch = this._firestoreService.getBatch();

    // Clear a single day's contents
    if (day) {
      batch.update(
        this._docRefService.getMenu(menu.id),
        this._getMenuDayUpdates({ day, dishes: [] })
      );
      const dishCounts = this._countDishes(menu);
      menu.contents[day].forEach(dishId => {
        const dishInOtherDay = dishCounts[dishId] > 1;
        batch.update(this._docRefService.getDish(dishId),
          this._getDishUpdates({
            menuId: menu.id,
            daysChange: -1,
            menusChange: dishInOtherDay ? 0 : -1,
          })
        );
      });
    }
    // Clear all days' contents
    else {
      batch.update(
        this._docRefService.getMenu(menu.id),
        this._getMenuDaysUpdates(),
      );
      this._getDishesUpdates(menu).forEach(
        ({ docRef, usages, menus }) => batch.update(docRef, {
          usages,
          ...(menus && { menus }),
        })
      );
    }

    await batch.commit();
  }

  public async deleteDish(dish: Dish): Promise<void> {
    await this._firestoreService.getTransaction(async transaction => {
      const isNotDishId = (dishId: string) => dishId !== dish.id;
      let menusUpdates = [];
      for (const menuId of dish.menus) {
        const docRef = this._docRefService.getMenu(menuId);
        const menuSnapshot = await transaction.get(docRef);
        const menu = menuSnapshot.data();
        if (menu) {
          menusUpdates.push({
            docRef,
            ...this._getMenuDaysUpdates(
              menu,
              (dishes) => dishes.filter(isNotDishId)
            ),
          });
        }
      }
      menusUpdates.forEach(({ docRef, contents }) => {
        transaction.update(docRef, { contents });
      });
      this._getTagsUpdates(dish).forEach(
        ({ docRef, dishes }) => transaction.update(docRef, { dishes })
      );
      transaction.delete(this._docRefService.getDish(dish.id));
    });
  }

  public async deleteTag(tag: Tag): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._docRefService.getTag(tag.id));
    tag.dishes
      .map(dishId => this._docRefService.getDish(dishId))
      .forEach(dish => batch.update(dish, {
        tags: this._firestoreService.removeFromArray(tag.id)
      }));
    await batch.commit();
  }

  private _getMenuDayUpdates({ day, dishes }: {
    day: Day,
    dishes: string[]
  }): { [key: string]: string[] } {
    return { [`contents.${day}`]: dishes };
  }

  private _getMenuDaysUpdates(
    menu?: MenuDbo,
    getDishes?: (dishes: string[]) => string[]
  ): { contents: { [day in Day]: string[] }} {
    return { contents: {
      Monday: (menu && getDishes) ? getDishes(menu.contents.Monday) : [],
      Tuesday: (menu && getDishes) ? getDishes(menu.contents.Tuesday) : [],
      Wednesday: (menu && getDishes) ? getDishes(menu.contents.Wednesday) : [],
      Thursday: (menu && getDishes) ? getDishes(menu.contents.Thursday) : [],
      Friday: (menu && getDishes) ? getDishes(menu.contents.Friday) : [],
      Saturday: (menu && getDishes) ? getDishes(menu.contents.Saturday) : [],
      Sunday: (menu && getDishes) ? getDishes(menu.contents.Sunday) : [],
    }};
  }

  private _getDishUpdates({ menuId, daysChange, menusChange }: {
    menuId: string,
    daysChange: number,
    menusChange: number,
  }): { usages: number, menus?: string[] } {
    const usages = this._firestoreService.changeCounter(daysChange);
    const menus = menusChange > 0
      ? this._firestoreService.addToArray(menuId)
      : this._firestoreService.removeFromArray(menuId);
    return { usages, ...(menusChange !== 0 && { menus }) }; // only include `menus` if `menusChange` isn't 0
  }

  private _getDishesUpdates<T extends MenuDbo>(menu: T): {
    docRef: DocumentReference<DishDbo>,
    usages: number,
    menus?: string[],
  }[] {
    const dishCounts = this._countDishes(menu);
    return Object
      .keys(dishCounts)
      .map(dishId => ({
        docRef: this._docRefService.getDish(dishId),
        ...this._getDishUpdates({
          menuId: menu.id,
          daysChange: -(dishCounts[dishId]),
          menusChange: -1,
        })
      }));
  }

  private _getTagsUpdates(dish: Dish, updateTagIds: string[] = []): {
    docRef: DocumentReference<TagDbo>,
    dishes: string[],
  }[] {
    const dishTagIds = dish.tags.map(dish => dish.id)
    const allIds = [...new Set([
      ...dishTagIds,
      ...updateTagIds
    ])];
    const tagUpdates = [];
    for (let id of allIds) {
      let dishes = undefined;

      if (dishTagIds.includes(id) && !updateTagIds.includes(id)) {
        dishes = this._firestoreService.removeFromArray(dish.id);
      } else if (!dishTagIds.includes(id) && updateTagIds.includes(id)) {
        dishes = this._firestoreService.addToArray(dish.id);
      }

      if (dishes) {
        tagUpdates.push({
          docRef: this._docRefService.getTag(id),
          dishes,
        });
      }
    }
    return tagUpdates;
  }

  private _countDishes<TMenu extends MenuDbo>(menu: TMenu): { [dishId: string]: number } {
    return Object
      .values(menu.contents)
      .reduce((allDishIds, dayDishIds) => ([...allDishIds, ...dayDishIds]), [])
      .reduce((hashMap, dishId) => ({
        ...hashMap,
        [dishId]: hashMap[dishId] ? hashMap[dishId] + 1 : 1
      }), {} as { [dishId: string]: number });
  }
}
