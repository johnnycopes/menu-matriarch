import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { concatMap, first, map, switchMap, tap } from 'rxjs/operators';

import { Endpoint } from '@models/enums/endpoint.enum';
import { DishDbo } from '@models/dbos/dish-dbo.interface';
import { Dish } from '@models/interfaces/dish.interface';
import { Tag } from '@models/interfaces/tag.interface';
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
        return this._getDish(dish, tags);
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

  public updateDish(
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
          this._getTagUpdates(dish, updates.tags).forEach(
            ({ docRef, dishes }) => batch.update(docRef, { dishes })
          );
        }
        await batch.commit();
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
        await this._firestoreService.getTransaction(async transaction => {
          const isNotDishId = (dishId: string) => dishId !== dish.id;
          let menuUpdates = [];
          for (const menuId of dish.menus) {
            const menuDoc = this._docRefService.getMenu(menuId);
            const menu = await transaction.get(menuDoc);
            const menuContents = menu.data()?.contents;
            if (menuContents) {
              const contents = {
                Monday: menuContents.Monday.filter(isNotDishId),
                Tuesday: menuContents.Tuesday.filter(isNotDishId),
                Wednesday: menuContents.Wednesday.filter(isNotDishId),
                Thursday: menuContents.Thursday.filter(isNotDishId),
                Friday: menuContents.Friday.filter(isNotDishId),
                Saturday: menuContents.Saturday.filter(isNotDishId),
                Sunday: menuContents.Sunday.filter(isNotDishId),
              };
              menuUpdates.push({
                docRef: menuDoc,
                contents,
              });
            }
          }
          menuUpdates.forEach(({ docRef, contents }) => {
            transaction.update(docRef, { contents });
          });
          this._getTagUpdates(dish).forEach(
            ({ docRef, dishes }) => transaction.update(docRef, { dishes })
          );
          transaction.delete(this._docRefService.getDish(dish.id));
        });
      })
    );
  }

  private _getDish(dish: DishDbo, tags: Tag[]): Dish {
    return {
      ...dish,
      tags: tags.filter(tag => dish.tags.includes(tag.id))
    };
  }


  private _getTagUpdates(
    dish: Dish,
    updateTagIds: string[] = []
  ) {
    const dishTagIds = dish.tags.map(dish => dish.id)
    const allIds = [...new Set([
      ...dishTagIds,
      ...updateTagIds
    ])];
    const tagUpdates = [];
    for (let id of allIds) {
      let dishesUpdate = undefined;

      if (dishTagIds.includes(id) && !updateTagIds.includes(id)) {
        dishesUpdate = this._firestoreService.removeFromArray(dish.id);
      } else if (!dishTagIds.includes(id) && updateTagIds.includes(id)) {
        dishesUpdate = this._firestoreService.addToArray(dish.id);
      }

      if (dishesUpdate) {
        tagUpdates.push({
          docRef: this._docRefService.getTag(id),
          dishes: dishesUpdate,
        });
      }
    }
    return tagUpdates;
  }
}
