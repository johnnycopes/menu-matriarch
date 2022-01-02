import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { concatMap, first, tap } from 'rxjs/operators';

import { DishDto } from '@models/dtos/dish-dto.interface';
import { Dish } from '@models/dish.interface';
import { BatchService } from './batch.service';
import { DishDocumentService } from './dish-document.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class DishService {

  constructor(
    private _batchService: BatchService,
    private _dishDocumentService: DishDocumentService,
    private _userService: UserService,
  ) { }

  public getDish(id: string): Observable<Dish | undefined> {
    return this._dishDocumentService.getDish(id);
  }

  public getDishes(): Observable<Dish[]> {
    return this._dishDocumentService.getDishes();
  }

  public createDish(dish: Partial<Omit<DishDto, 'id' | 'uid'>>): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._dishDocumentService.createDish({ uid, dish });
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
        await this._dishDocumentService.updateDish(dish, updates);
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
}
