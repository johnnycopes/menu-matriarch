import { Injectable } from '@angular/core';

import { Day } from '@models/day.type';
import { Menu } from '@models/menu.interface';
import { Endpoint } from '@models/endpoint.enum';
import { dedupe } from '@utility/generic/dedupe';
import { flattenValues } from '@utility/generic/flatten-values';
import { Batch, BatchUpdate } from './batch';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class BatchService {

  constructor(private _firestoreService: FirestoreService) { }

  public createBatch(): Batch {
    return new Batch(
      this._firestoreService.createBatch(),
      (endpoint, id) => this._firestoreService.getDocRef(endpoint, id),
    );
  }

  public getMenuContentsUpdates({ menuIds, dishIds, day, change }: {
    menuIds: string[],
    dishIds: string[],
    day?: Day,
    change?: 'add' | 'remove',
  }): BatchUpdate[] {
    if (dishIds.length && !change) {
      throw new Error("A 'change' argument is needed in order to modify the menus' dishes");
    }
    let dishes: string[] = [];
    if (change === 'add') {
      dishes = this._firestoreService.addToArray(...dishIds);
    } else if (change === 'remove') {
      dishes = this._firestoreService.removeFromArray(...dishIds);
    }
    let updates: { [contentsDay: string]: string[] } = {};
    if (day) {
      updates = this._getDayDishes(day, dishes);
    } else {
      updates = {
        ...this._getDayDishes('Monday', dishes),
        ...this._getDayDishes('Tuesday', dishes),
        ...this._getDayDishes('Wednesday', dishes),
        ...this._getDayDishes('Thursday', dishes),
        ...this._getDayDishes('Friday', dishes),
        ...this._getDayDishes('Saturday', dishes),
        ...this._getDayDishes('Sunday', dishes),
      };
    }
    return menuIds.map(menuId => ({
      endpoint: Endpoint.menus,
      id: menuId,
      updates,
    }));
  }

  public getMealUpdates({ key, initialMealIds, finalMealIds, entityId }: {
    key: 'dishes' | 'tags',
    initialMealIds: string[],
    finalMealIds: string[],
    entityId: string,
  }): BatchUpdate[] {
    return this._getBatchUpdates({
      endpoint: Endpoint.meals,
      key,
      initialIds: initialMealIds,
      finalIds: finalMealIds,
      entityId,
    });
  }

  public getDishUpdates({ key, initialDishIds, finalDishIds, entityId }: {
    key: 'meals' | 'tags',
    initialDishIds: string[],
    finalDishIds: string[],
    entityId: string,
  }): BatchUpdate[] {
    return this._getBatchUpdates({
      endpoint: Endpoint.dishes,
      key,
      initialIds: initialDishIds,
      finalIds: finalDishIds,
      entityId,
    });
  }

  public getDishCountersUpdates({ dishIds, menu, change }: {
    dishIds: string[],
    menu: Menu,
    change: 'increment' | 'decrement' | 'clear',
  }): BatchUpdate[] {
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
        endpoint: Endpoint.dishes,
        id: dishId,
        updates: {
          usages: this._firestoreService.changeCounter(change === 'increment' ? 1 : -1),
          ...(menusChange !== 0 && { menus }), // only include `menus` if `menusChange` isn't 0
        },
      };
    });
  }

  public getTagUpdates({ key, initialTagIds, finalTagIds, entityId }: {
    key: 'meals' | 'dishes',
    initialTagIds: string[],
    finalTagIds: string[],
    entityId: string,
  }): BatchUpdate[] {
    return this._getBatchUpdates({
      endpoint: Endpoint.tags,
      key,
      initialIds: initialTagIds,
      finalIds: finalTagIds,
      entityId,
    });
  }

  private _getBatchUpdates({ endpoint, key, initialIds, finalIds, entityId }: {
    endpoint: string,
    key: 'meals' | 'dishes' | 'tags',
    initialIds: string[],
    finalIds: string[],
    entityId: string,
  }): BatchUpdate[] {
    const batchUpdates = [];
    for (let id of dedupe(initialIds, finalIds)) {
      let updatedIds = undefined;

      if (initialIds.includes(id) && !finalIds.includes(id)) {
        updatedIds = this._firestoreService.removeFromArray(entityId);
      } else if (!initialIds.includes(id) && finalIds.includes(id)) {
        updatedIds = this._firestoreService.addToArray(entityId);
      }

      if (updatedIds) {
        batchUpdates.push({
          endpoint,
          id,
          updates: { [key]: updatedIds },
        });
      }
    }
    return batchUpdates;
  }

  private _getDayDishes(
    day: Day,
    dishes: string[]
  ): { [contentsDay: string]: string[] } {
    return { [`contents.${day}`]: dishes };
  }
}
