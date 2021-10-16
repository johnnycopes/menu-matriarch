import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { IUser } from '@models/interfaces/user.interface';
import { IMeal } from '@models/interfaces/meal.interface';
import { IMenu } from '@models/interfaces/menu.interface';
import { Day } from '@models/types/day.type';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private _firestore: AngularFirestore) { }

  public getUser = (uid: string | undefined): Observable<IUser | undefined> => {
    return this._firestore
      .collection<IUser | undefined>('users')
      .doc(uid)
      .valueChanges();
  }

  public createUser = async ({ uid, displayName, email, selectedMenuId }: {
    uid: string,
    displayName: string | null,
    email: string | null,
    selectedMenuId: string,
  }): Promise<void> => {
    await this._firestore
      .collection<IUser>('users')
      .doc(uid)
      .set({
        uid,
        name: displayName ?? 'friend',
        email: email ?? undefined,
        selectedMenuId,
        preferences: {
          darkMode: false,
          dayNameDisplay: 'full',
          menuStartDay: 'Monday',
        },
      });
  }

  public updateUser = async (uid: string | undefined, updates: Partial<IUser>) => {
    await this._firestore
      .collection<IUser>('users')
      .doc(uid)
      .update(updates);
  };

  public getMeals = (uid: string | undefined): Observable<IMeal[]> => {
    if (!uid) {
      return of([]);
    }
    return this._firestore
      .collection<IMeal>(
        'meals',
        ref => ref.where('uid', '==', uid)
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  public getMenus = (uid: string | undefined): Observable<IMenu[]> => {
    if (!uid) {
      return of([]);
    }
    return this._firestore
      .collection<IMenu>(
        'menus',
        ref => ref.where('uid', '==', uid),
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  public createMenu = async (uid: string): Promise<string> => {
    const menuDoc = this._firestore
      .collection<IMenu>('menus')
      .doc();
    const id = menuDoc.ref.id;
    await menuDoc.set({
      id,
      uid,
      name: '',
      favorited: false,
      contents: {
        Monday: undefined,
        Tuesday: undefined,
        Wednesday: undefined,
        Thursday: undefined,
        Friday: undefined,
        Saturday: undefined,
        Sunday: undefined,
      },
    });
    return id;
  }

  public updateMenu = async ({ menuId, day, mealId }: {
    menuId: string,
    day: Day,
    mealId: string | null
  }): Promise<void> => {
    const key = `contents.${day}`;
    await this._firestore
      .collection<IMenu>('menus')
      .doc(menuId)
      .ref
      .update({ [key]: mealId });
  }
}
