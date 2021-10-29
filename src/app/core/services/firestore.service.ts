import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { IUser } from '@models/interfaces/user.interface';
import { IMeal } from '@models/interfaces/meal.interface';
import { IMenu } from '@models/interfaces/menu.interface';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private _firestore: AngularFirestore) { }

  public getUser = (uid: string | undefined): Observable<IUser | undefined> => {
    return this._firestore
      .collection<IUser | undefined>('users')
      .doc(uid)
      .valueChanges()
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
      );
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
        email,
        preferences: {
          darkMode: false,
          dayNameDisplay: 'full',
          emptyMealText: 'undecided',
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

  public getMenus = (uid: string | undefined): Observable<IMenu[]> => {
    if (!uid) {
      return of([]);
    }
    return this._firestore
      .collection<IMenu>(
        'menus',
        ref => ref.where('uid', '==', uid),
      )
      .valueChanges()
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  public getMenu = (id: string): Observable<IMenu | undefined> => {
    return this._firestore
      .collection<IMenu | undefined>('menus')
      .doc(id)
      .valueChanges()
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  public createMenu = async (uid: string, name: string): Promise<string> => {
    const menuDoc = this._firestore
      .collection<IMenu>('menus')
      .doc();
    const id = menuDoc.ref.id;
    await menuDoc.set({
      id,
      uid,
      name,
      favorited: false,
      contents: {
        Monday: null,
        Tuesday: null,
        Wednesday: null,
        Thursday: null,
        Friday: null,
        Saturday: null,
        Sunday: null,
      },
    });
    return id;
  }

  public updateMenu = async (id: string, updates: Partial<IMenu>): Promise<void> => {
    return this._firestore
      .collection<IMenu>('menus')
      .doc(id)
      .update(updates);
  }

  public deleteMenu = async (id: string): Promise<void> => {
    await this._firestore
      .collection<IMenu>('menus')
      .doc(id)
      .delete();
  }

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
      .valueChanges()
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  public getMeal = (id: string): Observable<IMeal | undefined> => {
    return this._firestore
      .doc<IMeal>(`meals/${id}`)
      .valueChanges()
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
}
