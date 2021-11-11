import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { concatMap, first, switchMap } from 'rxjs/operators';

import { IDish } from '@models/interfaces/dish.interface';
import { DishType } from '@models/types/dish-type.type';
import { FirestoreService } from './firestore.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class DishService {
  private _endpoint = 'dishes';

  constructor(
    private _firestoreService: FirestoreService,
    private _userService: UserService,
  ) { }

  public getDish(id: string): Observable<IDish | undefined> {
    return this._firestoreService.getOne<IDish>(this._endpoint, id);
  }

  public getDishes(): Observable<IDish[]> {
    return this._userService.uid$.pipe(
      switchMap(uid => this._firestoreService.getMany<IDish>(this._endpoint, uid))
    );
  }

  public createDish(
    { name, description, type }: { name: string, description: string, type: DishType }
  ): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._firestoreService.createId();
          await this._firestoreService.create<IDish>(
            this._endpoint,
            id,
            {
              id,
              uid,
              name,
              description,
              type,
              favorited: false,
              ingredients: [],
              tags: [],
              menus: [],
              usages: 0,
            }
          );
          return id;
        } else {
          return undefined;
        }
      })
    );
  }

  public updateDish(id: string, updates: Partial<IDish>): Promise<void> {
    return this._firestoreService.update<IDish>(this._endpoint, id, updates);
  }

  public deleteDish(id: string): Promise<void> {
    return this._firestoreService.delete<IDish>(this._endpoint, id);
  }
}
