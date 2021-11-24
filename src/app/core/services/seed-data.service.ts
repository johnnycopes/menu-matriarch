import { Injectable } from '@angular/core';
import { createDishDto, createMenuDto, createTagDto, createUserDto } from '@models/dtos/create-dtos';
import { BatchService } from './batch.service';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class SeedDataService {

  constructor(
    private _batchService: BatchService,
    private _firestoreService: FirestoreService,
  ) { }

  public async createUserData({ uid, name, email }: {
    uid: string,
    name: string,
    email: string,
  }): Promise<string> {
    const batch = this._firestoreService.getBatch();
    const firstMenuId = this._firestoreService.createId();
    const secondMenuId = this._firestoreService.createId();
    const pizzaDishId = this._firestoreService.createId();
    const sushiDishId = this._firestoreService.createId();
    const thaiCurryDishId = this._firestoreService.createId();
    const easyTagId = this._firestoreService.createId();
    const pescatarianTagId = this._firestoreService.createId();
    const veganTagId = this._firestoreService.createId();
    const vegetarianTagId = this._firestoreService.createId();
    batch
      .set(
        this._batchService.getUserDoc(uid),
        createUserDto({ uid, name, email }),
      )
      .set(
        this._batchService.getMenuDoc(firstMenuId),
        createMenuDto({ id: firstMenuId, uid, name: 'Menu #1', contents: {
          Monday: [pizzaDishId],
          Tuesday: [sushiDishId],
          Wednesday: [thaiCurryDishId],
          Thursday: [],
          Friday: [pizzaDishId],
          Saturday: [],
          Sunday: [],
        } }),
      )
      .set(
        this._batchService.getMenuDoc(secondMenuId),
        createMenuDto({ id: firstMenuId, uid, name: 'Menu #2', contents: {
          Monday: [],
          Tuesday: [],
          Wednesday: [pizzaDishId],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: [],
        } }),
      )
      .set(
        this._batchService.getDishDoc(pizzaDishId),
        createDishDto({
          id: pizzaDishId,
          uid,
          name: 'Pizza',
          description: 'Delicious round vessel from Italy',
          link: 'https://cooking.nytimes.com/guides/1-how-to-make-pizza',
          menus: [firstMenuId, secondMenuId],
          tags: [vegetarianTagId],
          usages: 3,
        })
      )
      .set(
        this._batchService.getDishDoc(sushiDishId),
        createDishDto({
          id: sushiDishId,
          uid,
          name: 'Sushi',
          description: 'Delicious tiny vessels from Japan',
          menus: [firstMenuId],
          tags: [pescatarianTagId],
          usages: 1,
        })
      )
      .set(
        this._batchService.getDishDoc(thaiCurryDishId),
        createDishDto({
          id: thaiCurryDishId,
          uid,
          name: 'Thai Curry',
          description: 'Delicious fragrant stew from Thailand',
          link: 'https://cooking.nytimes.com/recipes/1015694-vegan-thai-curry-vegetables',
          menus: [secondMenuId],
          tags: [easyTagId, veganTagId, vegetarianTagId],
          usages: 1,
        })
      )
      .set(
        this._batchService.getTagDoc(easyTagId),
        createTagDto({ id: easyTagId, uid, name: 'Easy', dishes: [thaiCurryDishId] }),
      )
      .set(
        this._batchService.getTagDoc(pescatarianTagId),
        createTagDto({ id: pescatarianTagId, uid, name: 'Pescatarian', dishes: [sushiDishId] }),
      )
      .set(
        this._batchService.getTagDoc(veganTagId),
        createTagDto({ id: veganTagId, uid, name: 'Vegan', dishes: [thaiCurryDishId] }),
      )
      .set(
        this._batchService.getTagDoc(vegetarianTagId),
        createTagDto({ id: vegetarianTagId, uid, name: 'Vegetarian', dishes: [pizzaDishId, thaiCurryDishId] }),
      );
    await batch.commit();
    return firstMenuId;
  }
}
