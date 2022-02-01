import { Injectable } from '@angular/core';

import { Day } from '@models/day.type';
import { Menu } from '@models/menu.interface';
import { Endpoint } from '@models/endpoint.enum';
import { dedupe } from '@utility/generic/dedupe';
import { tally } from '@utility/generic/tally';
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
    let updatedDishIds: string[] = [];
    if (change === 'add') {
      updatedDishIds = this._firestoreService.addToArray(...dishIds);
    } else if (change === 'remove') {
      updatedDishIds = this._firestoreService.removeFromArray(...dishIds);
    }
    let data: { [contentsDay: string]: string[] } = {};
    if (day) {
      data = this._getDayData(day, updatedDishIds);
    } else {
      data = {
        ...this._getDayData('Monday', updatedDishIds),
        ...this._getDayData('Tuesday', updatedDishIds),
        ...this._getDayData('Wednesday', updatedDishIds),
        ...this._getDayData('Thursday', updatedDishIds),
        ...this._getDayData('Friday', updatedDishIds),
        ...this._getDayData('Saturday', updatedDishIds),
        ...this._getDayData('Sunday', updatedDishIds),
      };
    }
    return menuIds.map(menuId => ({
      endpoint: Endpoint.menus,
      id: menuId,
      data,
    }));
  }

  public getMealUpdates({ key, initialMealIds, finalMealIds, entityId }: {
    key: 'dishIds' | 'tagIds',
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
    key: 'mealIds' | 'tagIds',
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
    const dishCounts = tally(flattenValues(menu.contents));
    return dishIds.map(dishId => {
      const dishCount = dishCounts[dishId] ?? 0;
      let menusChange = 0;
      if (dishCount === 0 && change === 'increment') {
        menusChange = 1;
      } else if ((dishCount === 1 && change === 'decrement') || change === 'clear') {
        menusChange = -1;
      }
      const menuIds = menusChange > 0
        ? this._firestoreService.addToArray(menu.id)
        : this._firestoreService.removeFromArray(menu.id);
      return {
        endpoint: Endpoint.dishes,
        id: dishId,
        data: {
          usages: this._firestoreService.changeCounter(change === 'increment' ? 1 : -1),
          ...(menusChange !== 0 && { menuIds }), // only include `menuIds` if `menusChange` isn't 0
        },
      };
    });
  }

  public getTagUpdates({ key, initialTagIds, finalTagIds, entityId }: {
    key: 'mealIds' | 'dishIds',
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
    key: 'mealIds' | 'dishIds' | 'tagIds',
    initialIds: string[],
    finalIds: string[],
    entityId: string,
  }): BatchUpdate[] {
    const batchUpdates: BatchUpdate[] = [];
    for (const id of dedupe(initialIds, finalIds)) {
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
          data: { [key]: updatedIds },
        });
      }
    }
    return batchUpdates;
  }

  private _getDayData(
    day: Day,
    dishIds: string[]
  ): { [contentsDay: string]: string[] } {
    return { [`contents.${day}`]: dishIds };
  }
}
