import { Injectable } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

import { DishDto } from '@models/dtos/dish-dto.interface';
import { MealDto } from '@models/dtos/meal-dto.interface';
import { MenuDto } from '@models/dtos/menu-dto.interface';
import { TagDto } from '@models/dtos/tag-dto.interface';
import { UserDto } from '@models/dtos/user-dto.interface';
import { Day } from '@models/day.type';
import { Menu } from '@models/menu.interface';
import { Endpoint } from '@models/endpoint.enum';
import { dedupe } from '@utility/generic/dedupe';
import { flattenValues } from '@utility/generic/flatten-values';
import { FirestoreService } from './firestore.service';

interface DocRefUpdate<T> {
  docRef: DocumentReference<T>;
  updates: firebase.firestore.UpdateData;
}

type Change = 'increment' | 'decrement' | 'clear';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private _firestoreService: FirestoreService) { }

  public getUserDoc(uid: string): DocumentReference<UserDto> {
    return this._firestoreService.getDocRef<UserDto>(Endpoint.users, uid);
  }

  public getMealDoc(id: string): DocumentReference<MealDto> {
    return this._firestoreService.getDocRef<MealDto>(Endpoint.meals, id);
  }

  public getMenuDoc(id: string): DocumentReference<MenuDto> {
    return this._firestoreService.getDocRef<MenuDto>(Endpoint.menus, id);
  }

  public getDishDoc(id: string): DocumentReference<DishDto> {
    return this._firestoreService.getDocRef<DishDto>(Endpoint.dishes, id);
  }

  public getTagDoc(id: string): DocumentReference<TagDto> {
    return this._firestoreService.getDocRef<TagDto>(Endpoint.tags, id);
  }

  public processUpdates(
    batch: firebase.firestore.WriteBatch,
    docRefUpdates: DocRefUpdate<any>[]
  ): void {
    docRefUpdates.forEach(
      ({ docRef, updates }) => batch.update(docRef, updates)
    );
  }

  public getMenuContentsUpdates({ menuIds, change, day, dishIds }: {
    change: Change,
    menuIds: string[],
    dishIds?: string[],
    day?: Day,
  }): DocRefUpdate<MenuDto>[] {
    let updates = {};
    let dishes: string[] = [];
    if (change === 'increment' && dishIds) {
      dishes = this._firestoreService.addToArray(...dishIds);
    } else if (change === 'decrement' && dishIds) {
      dishes = this._firestoreService.removeFromArray(...dishIds);
    }

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
      docRef: this.getMenuDoc(menuId),
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
      getDoc: (id) => this.getMealDoc(id),
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
      getDoc: (id) => this.getDishDoc(id),
      key,
      initialIds: initialDishIds,
      finalIds: finalDishIds,
      entityId,
    });
  }

  public getDishCountersUpdates({ dishIds, menu, change }: {
    dishIds: string[],
    menu: Menu,
    change: Change,
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
        docRef: this.getDishDoc(dishId),
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
      getDoc: (id) => this.getTagDoc(id),
      key,
      initialIds: initialTagIds,
      finalIds: finalTagIds,
      entityId,
    });
  }

  private _getDocUpdates<T>({ getDoc, key, initialIds, finalIds, entityId }: {
    getDoc: (id: string) => DocumentReference<T>,
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
          docRef: getDoc(id),
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
