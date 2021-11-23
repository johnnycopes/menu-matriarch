import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { concatMap, first, map, switchMap, tap } from 'rxjs/operators';

import { Endpoint } from '@models/enums/endpoint.enum';
import { DishDto } from '@models/dtos/dish-dto.interface';
import { Dish } from '@models/interfaces/dish.interface';
import { Tag } from '@models/interfaces/tag.interface';
import { DishType } from '@models/types/dish-type.type';
import { lower } from '@shared/utility/format';
import { sort } from '@shared/utility/sort';
import { FirestoreService } from './firestore.service';
import { BatchService } from './batch.service';
import { TagService } from './tag.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class DishService {
  private _endpoint = Endpoint.dishes;

  constructor(
    private _firestoreService: FirestoreService,
    private _batchService: BatchService,
    private _tagService: TagService,
    private _userService: UserService,
  ) { }

  public getDish(id: string): Observable<Dish | undefined> {
    return combineLatest([
      this._firestoreService.getOne<DishDto>(this._endpoint, id),
      this._tagService.getTags(),
    ]).pipe(
      map(([dish, tags]) => {
        if (!dish) {
          return undefined;
        }
        return this._getDish(dish, tags);
      })
    );
  }

  public getDishes(): Observable<Dish[]> {
    return combineLatest([
      this._userService.uid$.pipe(
        switchMap(uid => this._firestoreService.getMany<DishDto>(this._endpoint, uid)),
        map(dishes => sort(dishes, dish => lower(dish.name)))
      ),
      this._tagService.getTags(),
    ]).pipe(
      map(([dishes, tags]) => dishes.map(dish => this._getDish(dish, tags)))
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
          await this._firestoreService.create<DishDto>(
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

  public updateDish(
    id: string,
    updates: Partial<Omit<DishDto, 'usages' | 'menus'>>
  ): Observable<Dish | undefined> {
    return this.getDish(id).pipe(
      first(),
      tap(async dish => {
        if (!dish) {
          return;
        }
        await this._batchService.updateDish(dish, updates);
      })
    );
  }

  public deleteDish(id: string): Observable<Dish | undefined> {
    return this.getDish(id).pipe(
      first(),
      tap(async dish => {
        if (!dish) {
          return;
        }
        await this._batchService.deleteDish(dish);
      })
    );
  }

  private _getDish(dish: DishDto, tags: Tag[]): Dish {
    return {
      ...dish,
      tags: tags.filter(tag => dish.tags.includes(tag.id))
    };
  }
}
