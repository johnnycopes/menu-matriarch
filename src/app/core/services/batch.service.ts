import { Injectable } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

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
    const dishIdCount = Object
      .values(menu.contents)
      .reduce((allDishIds, dayDishIds) => ([...allDishIds, ...dayDishIds]), [])
      .reduce((accum, curr) => accum + (curr === dishId ? 1 : 0), 0);
    let menusChange = 0;
    if (dishIdCount === 0 && selected) {
      menusChange = 1;
    } else if (dishIdCount === 1 && !selected) {
      menusChange = -1;
    }
    batch.update(
      this._docRefService.getDish(dishId),
      this._getDishMenusAndUsages({
        menuId: menu.id,
        daysChange: selected ? 1 : -1,
        menusChange: menusChange,
      })
    );
    batch.update(this._docRefService.getMenu(menu.id), {
      [`contents.${day}`]: selected
        ? this._firestoreService.addToArray(dishId)
        : this._firestoreService.removeFromArray(dishId)
    });
    await batch.commit();
  }

  public async updateDish(dish: Dish, updates: Partial<Omit<DishDbo, 'usages' | 'menus'>>) {
    const batch = this._firestoreService.getBatch();
    batch.update(this._docRefService.getDish(dish.id), updates);
    if (updates.tags) {
      this._getTagUpdates(dish, updates.tags).forEach(
        ({ docRef, dishes }) => batch.update(docRef, { dishes })
      );
    }
    await batch.commit();
  }

  public async deleteMenu(menu: MenuDbo): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._docRefService.getMenu(menu.id));
    this._deleteAllDaysMenuContents(batch, menu);
    await batch.commit();
  }

  public async deleteMenuContents(menu: Menu, day?: Day) {
    const batch = this._firestoreService.getBatch();

    // Clear a single day's contents
    if (day) {
      batch.update(this._docRefService.getMenu(menu.id), {
        [`contents.${day}`]: []
      });
      menu.contents[day].forEach(dishId => {
        const dishInOtherDay = Object
          .entries(menu.contents)
          .some(([ menuDay, menuDishIds ]) => day !== menuDay && menuDishIds.includes(dishId));
        // Always decrement `usages`, but only update `menus` if the dish isn't in any other day
        batch.update(
          this._docRefService.getDish(dishId),
          this._getDishMenusAndUsages({
            menuId: menu.id,
            daysChange: -1,
            menusChange: dishInOtherDay ? 0 : -1,
          })
        );
      });
    }
    // Clear all days' contents
    else {
      batch.update(this._docRefService.getMenu(menu.id), {
        contents: {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: [],
        }
      });
      this._deleteAllDaysMenuContents(batch, menu);
    }

    await batch.commit();
  }

  public async deleteDish(dish: Dish): Promise<void> {
    await this._firestoreService.getTransaction(async transaction => {
      const isNotDishId = (dishId: string) => dishId !== dish.id;
      let menuUpdates = [];
      for (const menuId of dish.menus) {
        const menuDoc = this._docRefService.getMenu(menuId);
        const menu = await transaction.get(menuDoc);
        const menuContents = menu.data()?.contents;
        if (menuContents) {
          const contents = {
            Monday: menuContents.Monday.filter(isNotDishId),
            Tuesday: menuContents.Tuesday.filter(isNotDishId),
            Wednesday: menuContents.Wednesday.filter(isNotDishId),
            Thursday: menuContents.Thursday.filter(isNotDishId),
            Friday: menuContents.Friday.filter(isNotDishId),
            Saturday: menuContents.Saturday.filter(isNotDishId),
            Sunday: menuContents.Sunday.filter(isNotDishId),
          };
          menuUpdates.push({
            docRef: menuDoc,
            contents,
          });
        }
      }
      menuUpdates.forEach(({ docRef, contents }) => {
        transaction.update(docRef, { contents });
      });
      this._getTagUpdates(dish).forEach(
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

  private _getDishMenusAndUsages({ menuId, daysChange, menusChange }: {
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

  private _deleteAllDaysMenuContents<T extends MenuDbo>(
    batch: firebase.firestore.WriteBatch,
    menu: T,
  ): void {
    const dishIdHashMap = Object
      .values(menu.contents)
      .reduce((allDishIds, dayDishIds) => ([...allDishIds, ...dayDishIds]), [])
      .reduce((hashMap, dishId) => ({
        ...hashMap,
        [dishId]: hashMap[dishId] ? hashMap[dishId] + 1 : 1
      }), {} as { [id: string]: number });
    Object
      .keys(dishIdHashMap)
      .forEach(dishId => {
        batch.update(
          this._docRefService.getDish(dishId),
          this._getDishMenusAndUsages({
            menuId: menu.id,
            daysChange: -(dishIdHashMap[dishId]),
            menusChange: -1,
          })
        );
      });
  }

  private _getTagUpdates(
    dish: Dish,
    updateTagIds: string[] = []
  ): { docRef: DocumentReference<TagDbo>, dishes: string[] }[] {
    const dishTagIds = dish.tags.map(dish => dish.id)
    const allIds = [...new Set([
      ...dishTagIds,
      ...updateTagIds
    ])];
    const tagUpdates = [];
    for (let id of allIds) {
      let dishesUpdate = undefined;

      if (dishTagIds.includes(id) && !updateTagIds.includes(id)) {
        dishesUpdate = this._firestoreService.removeFromArray(dish.id);
      } else if (!dishTagIds.includes(id) && updateTagIds.includes(id)) {
        dishesUpdate = this._firestoreService.addToArray(dish.id);
      }

      if (dishesUpdate) {
        tagUpdates.push({
          docRef: this._docRefService.getTag(id),
          dishes: dishesUpdate,
        });
      }
    }
    return tagUpdates;
  }
}
