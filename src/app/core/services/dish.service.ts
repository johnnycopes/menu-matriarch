import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { concatMap, first, tap } from 'rxjs/operators';

import { DishDto } from '@models/dtos/dish-dto.interface';
import { Dish } from '@models/dish.interface';
import { AuthService } from './auth.service';
import { DishDataService } from './dish-data.service';

@Injectable({
  providedIn: 'root'
})
export class DishService {

  constructor(
    private _authService: AuthService,
    private _dishDataService: DishDataService,
  ) { }

  public getDish(id: string): Observable<Dish | undefined> {
    return this._dishDataService.getDish(id);
  }

  public getDishes(): Observable<Dish[]> {
    return this._authService.uid$.pipe(
      first(),
      concatMap(uid => {
        if (uid) {
          return this._dishDataService.getDishes(uid);
        }
        return of([]);
      })
    );
  }

  public createDish(dish: Partial<Omit<DishDto, 'id' | 'uid'>>): Observable<string | undefined> {
    return this._authService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._dishDataService.createDish({ uid, dish });
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
        await this._dishDataService.updateDish(dish, updates);
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
        await this._dishDataService.deleteDish(dish);
      })
    );
  }
}
