import { Injectable } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

import { DishDto } from '@models/dtos/dish-dto.interface';
import { MealDto } from '@models/dtos/meal-dto.interface';
import { MenuDto } from '@models/dtos/menu-dto.interface';
import { TagDto } from '@models/dtos/tag-dto.interface';
import { UserDto } from '@models/dtos/user-dto.interface';
import { Endpoint } from '@models/endpoint.enum';

import { FirestoreService } from './firestore.service';
import { dedupe } from '@shared/utility/generic/dedupe';

interface DocRefUpdate<TDocRef, TUpdates extends firebase.firestore.UpdateData> {
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

  public getUpdatedDishDocs({ initialDishIds, finalDishIds, mealId }: {
    initialDishIds: string[],
    finalDishIds: string[],
    mealId: string,
  }): DocRefUpdate<DishDto, { [key: string]: string[] }>[] {
    return this._getUpdatedDocs({
      getDoc: (id) => this.getDishDoc(id),
      key: 'meals',
      initialIds: initialDishIds,
      finalIds: finalDishIds,
      entityId: mealId,
    });
  }

  public getUpdatedTagDocs({ key, initialTagIds, finalTagIds, entityId }: {
    key: 'meals' | 'dishes',
    initialTagIds: string[],
    finalTagIds: string[],
    entityId: string,
  }): DocRefUpdate<TagDto, { [key: string]: string[] }>[] {
    return this._getUpdatedDocs({
      getDoc: (id) => this.getTagDoc(id),
      key,
      initialIds: initialTagIds,
      finalIds: finalTagIds,
      entityId,
    });
  }

  private _getUpdatedDocs<T>({ getDoc, key, initialIds, finalIds, entityId }: {
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
}
