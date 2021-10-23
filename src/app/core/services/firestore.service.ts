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

  public createUser = async ({ uid, displayName, email }: {
    uid: string,
    displayName: string | null,
    email: string | null,
  }): Promise<void> => {
    await this._firestore
      .collection<IUser>('users')
      .doc(uid)
      .set({
        uid,
        name: displayName ?? 'friend',
        email: email ?? undefined,
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
        ref => ref
          .where('uid', '==', uid)
          .orderBy('name')
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  public getMeal = (id: string): Observable<IMeal | undefined> => {
    return this._firestore
      .doc<IMeal>(`meals/${id}`)
      .valueChanges({ idField: 'id' })
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  public createMeal = async (uid: string, { name, description }: Partial<IMeal>): Promise<string> => {
    const mealDoc = this._firestore
      .collection<IMeal>('meals')
      .doc();
    const id = mealDoc.ref.id;
    await mealDoc.set({
      id,
      uid,
      name: name ?? '',
      favorited: false,
      description: description ?? '',
      ingredients: [],
    });
    return id;
  }

  public updateMeal = async (id: string, updates: Partial<IMeal>): Promise<void> => {
    await this._firestore
      .collection<IMeal>('meals')
      .doc(id)
      .update(updates);
  }

  public deleteMeal = async (id: string): Promise<void> => {
    await this._firestore
      .collection<IMeal>('meals')
      .doc(id)
      .delete();
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

  public getMenu = (id: string): Observable<IMenu | undefined> => {
    return this._firestore
      .collection<IMenu | undefined>('menus')
      .doc(id)
      .valueChanges({ idField: 'id' })
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true })
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