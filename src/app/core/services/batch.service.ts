import { Injectable } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

import { DishDbo } from '@models/dbos/dish-dbo.interface';
import { MenuDbo } from '@models/dbos/menu-dbo.interface';
import { TagDbo } from '@models/dbos/tag-dbo.interface';
import { Endpoint } from '@models/enums/endpoint.enum';
import { Dish } from '@models/interfaces/dish.interface';
import { Tag } from '@models/interfaces/tag.interface';
import { FirestoreService } from './firestore.service';
import { Menu } from '@models/interfaces/menu.interface';
import { Day } from '@models/types/day.type';
import { flattenValues } from '@shared/utility/flatten-values';

@Injectable({
  providedIn: 'root'
})
export class BatchService {

  constructor(private _firestoreService: FirestoreService) { }

  public async updateMenuContents({
    menu, dishId, day, selected
  }: {
    menu: Menu,
    dishId: string,
    day: Day,
    selected: boolean,
  }): Promise<void> {
    const batch = this._firestoreService.getBatch();
    this._processUpdates(batch, [
      ...this._getDishesUpdates({
        dishIds: [dishId],
        menu,
        change: selected ? 'increment' : 'decrement'
      }),
      ...this._getMenusUpdates({
        menuIds: [menu.id],
        day,
        getDishes: selected
          ? () => this._firestoreService.addToArray(dishId)
          : () => this._firestoreService.removeFromArray(dishId)
      }),
    ]);
    await batch.commit();
  }

  public async updateDish(dish: Dish, updates: Partial<Omit<DishDbo, 'usages' | 'menus'>>) {
    const batch = this._firestoreService.getBatch();
    batch.update(this._getDishDoc(dish.id), updates);
    if (updates.tags) {
      this._processUpdates(batch, this._getTagsUpdates(dish, updates.tags));
    }
    await batch.commit();
  }

  public async deleteMenu(menu: MenuDbo): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._getMenuDoc(menu.id));
    this._processUpdates(batch,
      this._getDishesUpdates({
        dishIds: flattenValues(menu.contents),
        menu,
        change: 'clear'
      }),
    );
    await batch.commit();
  }

  public async deleteMenuContents(menu: Menu, day?: Day) {
    const batch = this._firestoreService.getBatch();
    // Clear a single day's contents
    if (day) {
      this._processUpdates(batch, [
        ...this._getMenusUpdates({ menuIds: [menu.id], day }),
        ...this._getDishesUpdates({
          dishIds: menu.contents[day],
          menu,
          change: 'decrement'
        }),
      ]);
    }
    // Clear all days' contents
    else {
      this._processUpdates(batch, [
        ...this._getMenusUpdates({ menuIds: [menu.id] }),
        ...this._getDishesUpdates({
          dishIds: flattenValues(menu.contents),
          menu,
          change: 'clear'
        }),
      ]);
    }
    await batch.commit();
  }

  public async deleteDish(dish: Dish): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._getDishDoc(dish.id));
    this._processUpdates(batch, [
      ...this._getMenusUpdates({
        menuIds: dish.menus,
        getDishes: () => this._firestoreService.removeFromArray(dish.id)
      }),
      ...this._getTagsUpdates(dish),
    ]);
    await batch.commit();
  }

  public async deleteTag(tag: Tag): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._getTagDoc(tag.id));
    tag.dishes
      .map(dishId => this._getDishDoc(dishId))
      .forEach(dish => batch.update(dish, {
        tags: this._firestoreService.removeFromArray(tag.id)
      }));
    await batch.commit();
  }

  private _getMenusUpdates({ menuIds, day, getDishes = () => [] }: {
    menuIds: string[],
    day?: Day,
    getDishes?: () => string[],
  }): {
    docRef: DocumentReference<MenuDbo>,
    updates: { [key: string]: string[] },
  }[] {
    let updates = {};
    if (day) {
      updates = this._getMenuDayDishes(day, getDishes());
    } else {
      updates = {
        ...this._getMenuDayDishes('Monday', getDishes()),
        ...this._getMenuDayDishes('Tuesday', getDishes()),
        ...this._getMenuDayDishes('Wednesday', getDishes()),
        ...this._getMenuDayDishes('Thursday', getDishes()),
        ...this._getMenuDayDishes('Friday', getDishes()),
        ...this._getMenuDayDishes('Saturday', getDishes()),
        ...this._getMenuDayDishes('Sunday', getDishes()),
      };
    }
    return menuIds.map(menuId => ({
      docRef: this._getMenuDoc(menuId),
      updates,
    }));
  }

  private _getDishesUpdates<TMenu extends MenuDbo>({ dishIds, menu, change }: {
    dishIds: string[],
    menu: TMenu,
    change: 'increment' | 'decrement' | 'clear',
  }): {
    docRef: DocumentReference<DishDbo>,
    updates: { usages: number, menus?: string[] }
  }[] {
    const dishCounts = flattenValues(menu.contents)
      .reduce((hashMap, dishId) => ({
        ...hashMap,
        [dishId]: hashMap[dishId] ? hashMap[dishId] + 1 : 1
      }), {} as { [dishId: string]: number });
    return dishIds.map(dishId => {
      const dishCount = dishCounts[dishId] ?? 0;
      let menusChange = 0;
      if (dishCount === 0 && change === 'increment') {
        menusChange = 1;
      } else if ((dishCount === 1 && change === 'decrement') || change === 'clear') {
        menusChange = -1;
      }
      const menus = menusChange > 0
        ? this._firestoreService.addToArray(menu.id)
        : this._firestoreService.removeFromArray(menu.id);
      return {
        docRef: this._getDishDoc(dishId),
        updates: {
          usages: this._firestoreService.changeCounter(change === 'increment' ? 1 : -1),
          ...(menusChange !== 0 && { menus }), // only include `menus` if `menusChange` isn't 0
        },
      };
    });
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
          docRef: this._getTagDoc(id),
          updates: { dishes },
        });
      }
    }
    return tagUpdates;
  }

  private _getMenuDayDishes(day: Day, dishes: string[]): { [key: string]: string[] } {
    return { [`contents.${day}`]: dishes };
  }

  private _getDishDoc(id: string): DocumentReference<DishDbo> {
    return this._firestoreService.getDocRef<DishDbo>(Endpoint.dishes, id);
  }

  private _getMenuDoc(id: string): DocumentReference<MenuDbo> {
    return this._firestoreService.getDocRef<MenuDbo>(Endpoint.menus, id);
  }

  private _getTagDoc(id: string): DocumentReference<TagDbo> {
    return this._firestoreService.getDocRef<TagDbo>(Endpoint.tags, id);
  }

  private _processUpdates(
    batch: firebase.firestore.WriteBatch,
    docRefUpdates: { docRef: DocumentReference, updates: {} }[]
  ): void {
    docRefUpdates.forEach(
      ({ docRef, updates }) => batch.update(docRef, updates)
    );
  }
}
