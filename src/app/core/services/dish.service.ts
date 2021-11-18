import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { concatMap, first, map, switchMap, tap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

import { Endpoint } from '@models/enums/endpoint.enum';
import { DishDbo } from '@models/dbos/dish-dbo.interface';
import { Dish } from '@models/interfaces/dish.interface';
import { DishType } from '@models/types/dish-type.type';
import { lower } from '@shared/utility/format';
import { sort } from '@shared/utility/sort';
import { FirestoreService } from './firestore.service';
import { DocRefService } from './doc-ref.service';
import { TagService } from './tag.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class DishService {
  private _endpoint = Endpoint.dishes;

  constructor(
    private _firestoreService: FirestoreService,
    private _docRefService: DocRefService,
    private _tagService: TagService,
    private _userService: UserService,
  ) { }

  public getDish(id: string): Observable<Dish | undefined> {
    return combineLatest([
      this._firestoreService.getOne<DishDbo>(this._endpoint, id),
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

  public getDishes(): Observable<Dish[]> {
    return combineLatest([
      this._userService.uid$.pipe(
        switchMap(uid => this._firestoreService.getMany<DishDbo>(this._endpoint, uid)),
        map(dishes => sort(dishes, dish => lower(dish.name)))
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
          await this._firestoreService.create<DishDbo>(
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
    updates: Partial<Omit<DishDbo, 'usages' | 'menus'>>
  ): Observable<Dish | undefined> {
    return this.getDish(id).pipe(
      first(),
      tap(async (dish) => {
        if (!dish) {
          return;
        }
        const batch = this._firestoreService.getBatch();
        batch.update(this._docRefService.getDish(dish.id), updates);
        if (updates.tags) {
          this._updateTags(batch, dish, updates.tags);
        }
        await batch.commit();
      })
    );
  }

  public updateDishCounters(
    id: string,
    updates: Partial<Pick<DishDbo, 'usages' | 'menus'>>
  ): Promise<void> {
    return this._updateDish(id, updates);
  }

  public deleteDish(id: string): Observable<Dish | undefined> {
    return this.getDish(id).pipe(
      first(),
      tap(async dish => {
        if (!dish) {
          return;
        }
        const batch = this._firestoreService.getBatch();
        batch.delete(this._docRefService.getDish(dish.id));
        this._updateTags(batch, dish);
        // TODO: delete dish id from menus
        await batch.commit();
      })
    );
  }

  private _updateDish(id: string, updates: Partial<DishDbo>): Promise<void> {
    return this._firestoreService.update<DishDbo>(this._endpoint, id, updates);
  }

  private _updateTags(
    batch: firebase.firestore.WriteBatch,
    dish: Dish,
    updateTagIds: string[] = []
  ): void {
    const dishTagIds = dish.tags.map(dish => dish.id)
    const allIds = [...new Set([
      ...dishTagIds,
      ...updateTagIds
    ])];
    for (let id of allIds) {
      let dishesUpdate = undefined;

      if (dishTagIds.includes(id) && !updateTagIds.includes(id)) {
        dishesUpdate = this._firestoreService.removeFromArray(dish.id);
      } else if (!dishTagIds.includes(id) && updateTagIds.includes(id)) {
        dishesUpdate = this._firestoreService.addToArray(dish.id);
      }

      if (dishesUpdate) {
        batch.update(this._docRefService.getTag(id), {
          dishes: dishesUpdate,
        });
      }
    }
  }
}
