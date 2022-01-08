import { Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { concatMap, first, map, tap } from 'rxjs/operators';

import { MealDto } from '@models/dtos/meal-dto.interface';
import { Dish } from '@models/dish.interface';
import { Meal } from '@models/meal.interface';
import { Tag } from '@models/tag.interface';
import { AuthService } from './auth.service';
import { DishService } from './dish.service';
import { MealDataService } from './meal-data.service';
import { TagService } from './tag.service';

@Injectable({
  providedIn: 'root'
})
export class MealService {

  constructor(
    private _authService: AuthService,
    private _dishService: DishService,
    private _mealDataService: MealDataService,
    private _tagService: TagService,
  ) { }

  public getMeal(id: string): Observable<Meal | undefined> {
    return combineLatest([
      this._mealDataService.getMeal(id),
      this._dishService.getDishes(),
      this._tagService.getTags(),
    ]).pipe(
      map(([mealDto, dishes, tags]) => {
        if (!mealDto) {
          return undefined;
        }
        return this._transformDto({ mealDto, dishes, tags });
      })
    );
  }

  public getMeals(): Observable<Meal[]> {
    return this._authService.uid$.pipe(
      first(),
      concatMap(uid => {
        if (uid) {
          return combineLatest([
            this._mealDataService.getMeals(uid),
            this._dishService.getDishes(),
            this._tagService.getTags(),
          ]).pipe(
            map(([mealDtos, dishes, tags]) =>
              mealDtos.map(mealDto => this._transformDto({ mealDto, dishes, tags }))
            )
          );
        }
        return of([]);
      })
    );
  }

  public createMeal(meal: Partial<Omit<MealDto, 'id' | 'uid'>>): Observable<string | undefined> {
    return this._authService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = await this._mealDataService.createMeal(uid, meal);
          return id;
        } else {
          return undefined;
        }
      })
    );
  }

  public updateMeal(
    id: string,
    updates: Partial<MealDto>
  ): Observable<Meal | undefined> {
    return this.getMeal(id).pipe(
      first(),
      tap(async meal => {
        if (!meal) {
          return;
        }
        await this._mealDataService.updateMeal(meal, updates);
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
        await this._mealDataService.deleteMeal(meal);
      })
    );
  }

  private _transformDto({ mealDto, dishes, tags }: {
    mealDto: MealDto,
    dishes: Dish[],
    tags: Tag[]
  }): Meal {
    return {
      ...mealDto,
      dishes: dishes.filter(dish => mealDto.dishes.includes(dish.id)),
      tags: tags.filter(tag => mealDto.tags.includes(tag.id)),
    };
  }
}
