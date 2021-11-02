import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
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

  public createId(): string {
    return this._firestore.createId();
  }

  public getOne<T>(endpoint: string, uid: string | undefined): Observable<T | undefined> {
    return this._firestore
      .collection<T | undefined>(endpoint)
      .doc(uid)
      .valueChanges()
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  public getMany<T>(endpoint: string, uid: string | undefined): Observable<T[]> {
    if (!uid) {
      return of([]);
    }
    return this._firestore
      .collection<T>(
        endpoint,
        ref => ref
          .where('uid', '==', uid)
          .orderBy('name')
      )
      .valueChanges()
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  public async create<T>(endpoint: string, details: T): Promise<DocumentReference<T>> {
    return await this._firestore
      .collection<T>(endpoint)
      .add(details);
  }

  public async update<T>(endpoint: string, id: string, updates: Partial<T>): Promise<void> {
    return this._firestore
      .collection<T>(endpoint)
      .doc(id)
      .update(updates);
  }

  public async delete<T>(id: string | undefined, endpoint: string): Promise<void> {
    await this._firestore
      .collection<T>(endpoint)
      .doc(id)
      .delete();
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
}
