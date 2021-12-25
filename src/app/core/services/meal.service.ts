import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { concatMap, first, map, switchMap, tap } from 'rxjs/operators';

import { MealDto } from '@models/dtos/meal-dto.interface';
import { Endpoint } from '@models/endpoint.enum';
import { Dish } from '@models/dish.interface';
import { Meal } from '@models/meal.interface';
import { Tag } from '@models/tag.interface';
import { createMealDto } from '@utility/domain/create-dtos';
import { sort } from '@utility/generic/sort';
import { lower } from '@utility/generic/format';
import { BatchService } from './batch.service';
import { DishService } from './dish.service';
import { FirestoreService } from './firestore.service';
import { TagService } from './tag.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MealService {
  private _endpoint = Endpoint.meals;

  constructor(
    private _firestoreService: FirestoreService,
    private _batchService: BatchService,
    private _dishService: DishService,
    private _tagService: TagService,
    private _userService: UserService,
  ) { }

  public getMeal(id: string): Observable<Meal | undefined> {
    return combineLatest([
      this._firestoreService.getOne<MealDto>(this._endpoint, id),
      this._dishService.getDishes(),
      this._tagService.getTags(),
    ]).pipe(
      map(([meal, dishes, tags]) => {
        if (!meal) {
          return undefined;
        }
        return this._getMeal(meal, dishes, tags);
      })
    );
  }

  public getMeals(): Observable<Meal[]> {
    return combineLatest([
      this._userService.uid$.pipe(
        switchMap(uid => this._firestoreService.getMany<MealDto>(this._endpoint, uid)),
        map(meals => sort(meals, meal => lower(meal.name)))
      ),
      this._dishService.getDishes(),
      this._tagService.getTags(),
    ]).pipe(
      map(([meals, dishes, tags]) => meals.map(meal => this._getMeal(meal, dishes, tags)))
    );
  }

  public createMeal(meal: Partial<Omit<MealDto, 'id' | 'uid'>>): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._firestoreService.createId();
          // TODO: need to write this method in batch service to properly update included dishes' meal counts (and eventually tag counts)
          await this._firestoreService.create<MealDto>(
            this._endpoint,
            id,
            createMealDto({ id, uid, ...meal })
          );
          return id;
        } else {
          return undefined;
        }
      })
    );
  }

  public deleteMeal(id: string): Observable<Meal | undefined> {
    return this.getMeal(id).pipe(
      first(),
      tap(async meal => {
        if (!meal) {
          return;
        }
        await this._batchService.deleteMeal(meal);
      })
    );
  }

  private _getMeal(meal: MealDto, dishes: Dish[], tags: Tag[]): Meal {
    return {
      ...meal,
      dishes: dishes.filter(dish => meal.dishes.includes(dish.id)),
      tags: tags.filter(tag => meal.tags.includes(tag.id)),
    };
  }
}
