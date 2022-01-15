import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MealDto } from '@models/dtos/meal-dto.interface';
import { Endpoint } from '@models/endpoint.enum';
import { Meal } from '@models/meal.interface';
import { createMealDto } from '@utility/domain/create-dtos';
import { lower } from '@utility/generic/format';
import { sort } from '@utility/generic/sort';
import { BatchService } from './batch.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class MealDataService {
  private _endpoint = Endpoint.meals;

  constructor(
    private _batchService: BatchService,
    private _dataService: DataService,
  ) { }

  public getMeal(id: string): Observable<MealDto | undefined> {
    return this._dataService.getOne<MealDto>(this._endpoint, id);
  }

  public getMeals(uid: string): Observable<MealDto[]> {
    return this._dataService.getMany<MealDto>(this._endpoint, uid).pipe(
      map(mealDtos => sort(mealDtos, mealDto => lower(mealDto.name)))
    );
  }

  public async createMeal(
    uid: string,
    meal: Partial<Omit<MealDto, 'id' | 'uid'>>
  ): Promise<string> {
    const id = this._dataService.createId();
    const batch = this._batchService.createBatch();
    batch.set({
      endpoint: this._endpoint,
      id,
      data: createMealDto({ id, uid, ...meal }),
    });
    if (meal.dishes) {
      batch.newUpdateMultiple(
        this._batchService.newGetDishUpdates({
          key: 'meals',
          initialDishIds: [],
          finalDishIds: meal.dishes,
          entityId: id,
        }),
      );
    }
    if (meal.tags) {
      batch.newUpdateMultiple(
        this._batchService.newGetTagUpdates({
          key: 'meals',
          initialTagIds: [],
          finalTagIds: meal.tags,
          entityId: id,
        }),
      );
    }
    await batch.commit();
    return id;
  }

  public async updateMeal(
    meal: Meal,
    updates: Partial<MealDto>
  ): Promise<void> {
    const batch = this._batchService.createBatch();
    batch.update({
      endpoint: this._endpoint,
      id: meal.id,
      updates,
    });
    if (updates.dishes) {
      batch.newUpdateMultiple(
        this._batchService.newGetDishUpdates({
          key: 'meals',
          initialDishIds: meal.dishes.map(dish => dish.id),
          finalDishIds: updates.dishes,
          entityId: meal.id,
        }),
      );
    }
    if (updates.tags) {
      batch.newUpdateMultiple(
        this._batchService.newGetTagUpdates({
          key: 'meals',
          initialTagIds: meal.tags.map(tag => tag.id),
          finalTagIds: updates.tags,
          entityId: meal.id,
        }),
      );
    }
    await batch.commit();
  }

  public async deleteMeal(meal: Meal): Promise<void> {
    const batch = this._batchService.createBatch();
    batch
      .delete(this._endpoint, meal.id)
      .newUpdateMultiple([
        ...this._batchService.newGetDishUpdates({
          key: 'meals',
          initialDishIds: meal.dishes.map(dish => dish.id),
          finalDishIds: [],
          entityId: meal.id,
        }),
        ...this._batchService.newGetTagUpdates({
          key: 'meals',
          initialTagIds: meal.tags.map(tag => tag.id),
          finalTagIds: [],
          entityId: meal.id,
        }),
      ]);
    await batch.commit();
  }
}
