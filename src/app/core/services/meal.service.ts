import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { concatMap, first, tap } from 'rxjs/operators';

import { MealDto } from '@models/dtos/meal-dto.interface';
import { Meal } from '@models/meal.interface';
import { AuthService } from './auth.service';
import { MealDataService } from './meal-data.service';

@Injectable({
  providedIn: 'root'
})
export class MealService {

  constructor(
    private _authService: AuthService,
    private _mealDataService: MealDataService,
  ) { }

  public getMeal(id: string): Observable<Meal | undefined> {
    return this._mealDataService.getMeal(id);
  }

  public getMeals(): Observable<Meal[]> {
    return this._authService.uid$.pipe(
      first(),
      concatMap(uid => {
        if (uid) {
          return this._mealDataService.getMeals(uid);
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
}
