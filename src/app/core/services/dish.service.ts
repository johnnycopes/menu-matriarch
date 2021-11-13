import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { concatMap, first, map, switchMap, tap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

import { IDishDbo } from '@models/dbos/dish-dbo.interface';
import { IDish } from '@models/interfaces/dish.interface';
import { ITag } from '@models/interfaces/tag.interface';
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
    { name, description, type, tags }: { name: string, description: string, type: DishType, tags: string[] }
  ): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._firestoreService.createId();
          await this._firestoreService.create<IDishDbo>(
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
              tags,
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

  public updateDishDetails(
    id: string,
    updates: Partial<Omit<IDishDbo, 'usages' | 'menus'>>
  ): Observable<IDish | undefined> {
    return this.getDish(id).pipe(
      first(),
      tap(async (dish) => {
        if (!dish) {
          return;
        }
        let tagUpdatePromises: Promise<void>[] = [];
        if (updates.tags) {
          tagUpdatePromises = this._getTagUpdatePromises(dish.tags, updates.tags);
        }
        await Promise.all([
          this._updateDish(id, updates),
          tagUpdatePromises,
        ]);
      })
    );
  }

  public updateDishCounters(
    id: string,
    updates: Partial<Pick<IDishDbo, 'usages' | 'menus'>>
  ): Promise<void> {
    return this._updateDish(id, updates);
  }

  public deleteDish(id: string): Observable<IDish | undefined> {
    return this.getDish(id).pipe(
      first(),
      tap(async dish => {
        if (!dish) {
          return;
        }
        await Promise.all([
          this._firestoreService.delete<IDishDbo>(this._endpoint, id),
          this._getTagUpdatePromises(dish.tags),
        ]);
      })
    );
  }

  private _updateDish(id: string, updates: Partial<IDishDbo>): Promise<void> {
    return this._firestoreService.update<IDishDbo>(this._endpoint, id, updates);
  }

  private _getTagUpdatePromises(
    dishTags: ITag[],
    updateTagIds: string[] = []
  ): Promise<void>[] {
    const dishTagIds = dishTags.map(dish => dish.id)
    const allIds = [...new Set([
      ...dishTagIds,
      ...updateTagIds
    ])];
    const updates: Promise<void>[] = [];

    for (let id of allIds) {
      let difference = 0;
      if (dishTagIds.includes(id) && !updateTagIds.includes(id)) {
        difference = -1;
      } else if (!dishTagIds.includes(id) && updateTagIds.includes(id)) {
        difference = 1;
      }
      if (difference !== 0) {
        updates.push(this._tagService.updateTag(id,
          {
            usages: firebase.firestore.FieldValue.increment(difference) as unknown as number,
          }
        ));
      }
    }

    return updates;
  }
}
