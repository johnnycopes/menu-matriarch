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

export interface DocRefUpdate<TDocRef, TUpdates extends firebase.firestore.UpdateData> {
  docRef: DocumentReference<TDocRef>;
  updates: TUpdates;
}

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
    docRefUpdates: DocRefUpdate<any, any>[]
  ): void {
    docRefUpdates.forEach(
      ({ docRef, updates }) => batch.update(docRef, updates)
    );
  }

  public getMenuContentsUpdates({ menuIds, day, getDishes = () => [] }: {
    menuIds: string[],
    day?: Day,
    getDishes?: () => string[],
  }): DocRefUpdate<MenuDto, { [key in string]: string[] }>[] {
    let updates = {};
    if (day) {
      updates = this._getDayDishes(day, getDishes());
    } else {
      updates = {
        ...this._getDayDishes('Monday', getDishes()),
        ...this._getDayDishes('Tuesday', getDishes()),
        ...this._getDayDishes('Wednesday', getDishes()),
        ...this._getDayDishes('Thursday', getDishes()),
        ...this._getDayDishes('Friday', getDishes()),
        ...this._getDayDishes('Saturday', getDishes()),
        ...this._getDayDishes('Sunday', getDishes()),
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
  }): DocRefUpdate<MealDto, { [key: string]: string[] }>[] {
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
  }): DocRefUpdate<DishDto, { [key: string]: string[] }>[] {
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
    change: 'increment' | 'decrement' | 'clear',
  }): DocRefUpdate<DishDto, { usages: number, menus?: string[] }>[] {
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
  }): DocRefUpdate<TagDto, { [key: string]: string[] }>[] {
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
  }): DocRefUpdate<T, { [key: string]: string[] }>[] {
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
