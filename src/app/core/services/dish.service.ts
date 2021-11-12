import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { concatMap, first, map, switchMap } from 'rxjs/operators';

import { IDish } from '@models/interfaces/dish.interface';
import { IDishDbo } from '@models/dbos/dish-dbo.interface';
import { DishType } from '@models/types/dish-type.type';
import { FirestoreService } from './firestore.service';
import { TagService } from './tag.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class DishService {
  private _endpoint = 'dishes';

  constructor(
    private _firestoreService: FirestoreService,
    private _tagService: TagService,
    private _userService: UserService,
  ) { }

  public getDish(id: string): Observable<IDish | undefined> {
    return combineLatest([
      this._firestoreService.getOne<IDishDbo>(this._endpoint, id),
      this._tagService.getTags(),
    ]).pipe(
      map(([dish, tags]) => {
        if (!dish) {
          return undefined;
        }
        return {
          ...dish,
          tags: tags.filter(tag => dish.tags.includes(tag.id))
        };
      })
    );
  }

  public getDishes(): Observable<IDish[]> {
    return combineLatest([
      this._userService.uid$.pipe(
        switchMap(uid => this._firestoreService.getMany<IDishDbo>(this._endpoint, uid))
      ),
      this._tagService.getTags(),
    ]).pipe(
      map(([dishes, tags]) => {
        return dishes.map(dish => ({
          ...dish,
          tags: tags.filter(tag => dish.tags.includes(tag.id))
        }));
      })
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

  public updateDish(id: string, updates: Partial<IDishDbo>): Promise<void> {
    return this._firestoreService.update<IDishDbo>(this._endpoint, id, updates);
  }

  public deleteDish(id: string): Promise<void> {
    return this._firestoreService.delete<IDishDbo>(this._endpoint, id);
  }
}
