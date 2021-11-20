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
        ({ docRef, updates }) => batch.update(docRef, updates)
      );
    }
    await batch.commit();
  }

  public async deleteMenu(menu: MenuDbo): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._docRefService.getMenu(menu.id));
    this._getDishesUpdates(menu).forEach(
      ({ docRef, updates }) => batch.update(docRef, updates)
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
      this._getMenusUpdates([menu.id]).forEach(
        ({ docRef, updates }) => batch.update(docRef, updates)
      );
      this._getDishesUpdates(menu).forEach(
        ({ docRef, updates }) => batch.update(docRef, updates)
      );
    }

    await batch.commit();
  }

  public async deleteDish(dish: Dish): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._docRefService.getDish(dish.id));
    this._getMenusUpdates(
      dish.menus,
      () => this._firestoreService.removeFromArray(dish.id)
    ).forEach(
      ({ docRef, updates }) => batch.update(docRef, updates)
    );
    this._getTagsUpdates(dish).forEach(
      ({ docRef, updates }) => batch.update(docRef, updates)
    );
    await batch.commit();
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

  private _getMenusUpdates(
    menuIds: string[],
    getDishes: () => string[] = () => [],
  ): {
    docRef: DocumentReference<MenuDbo>,
    updates: { [key: string]: string[] },
  }[] {
    return menuIds.map(menuId => ({
      docRef: this._docRefService.getMenu(menuId),
      updates: {
        ...this._getMenuDayUpdates({ day: 'Monday', dishes: getDishes() }),
        ...this._getMenuDayUpdates({ day: 'Tuesday', dishes: getDishes() }),
        ...this._getMenuDayUpdates({ day: 'Wednesday', dishes: getDishes() }),
        ...this._getMenuDayUpdates({ day: 'Thursday', dishes: getDishes() }),
        ...this._getMenuDayUpdates({ day: 'Friday', dishes: getDishes() }),
        ...this._getMenuDayUpdates({ day: 'Saturday', dishes: getDishes() }),
        ...this._getMenuDayUpdates({ day: 'Sunday', dishes: getDishes() }),
      }
    }));
  }

  private _getDishesUpdates<T extends MenuDbo>(menu: T): {
    docRef: DocumentReference<DishDbo>,
    updates: {
      usages: number,
      menus?: string[],
    },
  }[] {
    const dishCounts = this._countDishes(menu);
    return Object
      .keys(dishCounts)
      .map(dishId => ({
        docRef: this._docRefService.getDish(dishId),
        updates: {
          ...this._getDishUpdates({
            menuId: menu.id,
            daysChange: -(dishCounts[dishId]),
            menusChange: -1,
          })
        }
      }));
  }

  private _getTagsUpdates(dish: Dish, updateTagIds: string[] = []): {
    docRef: DocumentReference<TagDbo>,
    updates: {
      dishes: string[],
    },
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
          updates: { dishes },
        });
      }
    }
    return tagUpdates;
  }

  private _getMenuDayUpdates({ day, dishes }: {
    day: Day,
    dishes: string[]
  }): { [key: string]: string[] } {
    return { [`contents.${day}`]: dishes };
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
