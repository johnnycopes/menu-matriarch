import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MealDto } from '@models/dtos/meal-dto.interface';
import { Endpoint } from '@models/endpoint.enum';
import { Meal } from '@models/meal.interface';
import { createMealDto } from '@utility/domain/create-dtos';
import { lower } from '@utility/generic/format';
import { sort } from '@utility/generic/sort';
import { DataService } from './data.service';
import { DocumentService } from './document.service';

@Injectable({
  providedIn: 'root'
})
export class MealDataService {
  private _endpoint = Endpoint.meals;

  constructor(
    private _dataService: DataService,
    private _documentService: DocumentService,
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
    const batch = this._documentService.createBatch();
    batch.newSet({
      endpoint: this._endpoint,
      id,
      data: createMealDto({ id, uid, ...meal }),
    });
    if (meal.dishes) {
      batch.updateMultiple(
        this._documentService.getDishUpdates({
          key: 'meals',
          initialDishIds: [],
          finalDishIds: meal.dishes,
          entityId: id,
        }),
      );
    }
    if (meal.tags) {
      batch.updateMultiple(
        this._documentService.getTagUpdates({
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
    const batch = this._documentService.createBatch();
    batch.newUpdate({
      endpoint: this._endpoint,
      id: meal.id,
      updates,
    });
    if (updates.dishes) {
      batch.updateMultiple(
        this._documentService.getDishUpdates({
          key: 'meals',
          initialDishIds: meal.dishes.map(dish => dish.id),
          finalDishIds: updates.dishes,
          entityId: meal.id,
        }),
      );
    }
    if (updates.tags) {
      batch.updateMultiple(
        this._documentService.getTagUpdates({
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
    const batch = this._documentService.createBatch();
    batch
      .newDelete(this._endpoint, meal.id)
      .updateMultiple([
        ...this._documentService.getDishUpdates({
          key: 'meals',
          initialDishIds: meal.dishes.map(dish => dish.id),
          finalDishIds: [],
          entityId: meal.id,
        }),
        ...this._documentService.getTagUpdates({
          key: 'meals',
          initialTagIds: meal.tags.map(tag => tag.id),
          finalTagIds: [],
          entityId: meal.id,
        }),
      ]);
    await batch.commit();
  }
}
