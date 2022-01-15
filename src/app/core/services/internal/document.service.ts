import { Injectable } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';

import { DishDto } from '@models/dtos/dish-dto.interface';
import { MealDto } from '@models/dtos/meal-dto.interface';
import { MenuDto } from '@models/dtos/menu-dto.interface';
import { TagDto } from '@models/dtos/tag-dto.interface';
import { Day } from '@models/day.type';
import { DocRefUpdate } from '@models/doc-ref-update.interface';
import { Menu } from '@models/menu.interface';
import { Endpoint } from '@models/endpoint.enum';
import { dedupe } from '@utility/generic/dedupe';
import { flattenValues } from '@utility/generic/flatten-values';
import { Batch } from './batch';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

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
  }): DocRefUpdate<MenuDto>[] {
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
      docRef: this._getMenuDocRef(menuId),
      updates,
    }));
  }

  public getMealUpdates({ key, initialMealIds, finalMealIds, entityId }: {
    key: 'dishes' | 'tags',
    initialMealIds: string[],
    finalMealIds: string[],
    entityId: string,
  }): DocRefUpdate<MealDto>[] {
    return this._getDocUpdates({
      getDocRef: (id) => this._getMealDocRef(id),
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
  }): DocRefUpdate<DishDto>[] {
    return this._getDocUpdates({
      getDocRef: (id) => this._getDishDocRef(id),
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
  }): DocRefUpdate<DishDto>[] {
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
        docRef: this._getDishDocRef(dishId),
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
  }): DocRefUpdate<TagDto>[] {
    return this._getDocUpdates({
      getDocRef: (id) => this._getTagDocRef(id),
      key,
      initialIds: initialTagIds,
      finalIds: finalTagIds,
      entityId,
    });
  }

  private _getMealDocRef(id: string): DocumentReference<MealDto> {
    return this._firestoreService.getDocRef<MealDto>(Endpoint.meals, id);
  }

  private _getMenuDocRef(id: string): DocumentReference<MenuDto> {
    return this._firestoreService.getDocRef<MenuDto>(Endpoint.menus, id);
  }

  private _getDishDocRef(id: string): DocumentReference<DishDto> {
    return this._firestoreService.getDocRef<DishDto>(Endpoint.dishes, id);
  }

  private _getTagDocRef(id: string): DocumentReference<TagDto> {
    return this._firestoreService.getDocRef<TagDto>(Endpoint.tags, id);
  }

  private _getDocUpdates<T>({ getDocRef, key, initialIds, finalIds, entityId }: {
    getDocRef: (id: string) => DocumentReference<T>,
    key: 'meals' | 'dishes' | 'tags',
    initialIds: string[],
    finalIds: string[],
    entityId: string,
  }): DocRefUpdate<T>[] {
    const docUpdates = [];
    for (let id of dedupe(initialIds, finalIds)) {
      let updatedIds = undefined;

      if (initialIds.includes(id) && !finalIds.includes(id)) {
        updatedIds = this._firestoreService.removeFromArray(entityId);
      } else if (!initialIds.includes(id) && finalIds.includes(id)) {
        updatedIds = this._firestoreService.addToArray(entityId);
      }

      if (updatedIds) {
        docUpdates.push({
          docRef: getDocRef(id),
          updates: { [key]: updatedIds },
        });
      }
    }
    return docUpdates;
  }

  private _getDayDishes(
    day: Day,
    dishes: string[]
  ): { [contentsDay: string]: string[] } {
    return { [`contents.${day}`]: dishes };
  }
}
