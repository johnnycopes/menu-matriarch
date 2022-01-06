import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Dish } from '@models/dish.interface';
import { MealDto } from '@models/dtos/meal-dto.interface';
import { Endpoint } from '@models/endpoint.enum';
import { Meal } from '@models/meal.interface';
import { Tag } from '@models/tag.interface';
import { createMealDto } from '@utility/domain/create-dtos';
import { lower } from '@utility/generic/format';
import { sort } from '@utility/generic/sort';
import { ApiService } from './api.service';
import { DishService } from './dish.service';
import { DocumentService } from './document.service';
import { TagService } from './tag.service';

@Injectable({
  providedIn: 'root'
})
export class MealDocumentService {
  private _endpoint = Endpoint.meals;

  constructor(
    private _apiService: ApiService,
    private _dishService: DishService,
    private _documentService: DocumentService,
    private _tagService: TagService,
  ) { }

  public getMeal(id: string): Observable<Meal | undefined> {
    return combineLatest([
      this._apiService.getOne<MealDto>(this._endpoint, id),
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

  public getMeals(uid: string): Observable<Meal[]> {
    return combineLatest([
      this._apiService.getMany<MealDto>(this._endpoint, uid).pipe(
        map(mealDtos => sort(mealDtos, mealDto => lower(mealDto.name)))
      ),
      this._dishService.getDishes(),
      this._tagService.getTags(),
    ]).pipe(
      map(([mealDtos, dishes, tags]) =>
        mealDtos.map(mealDto => this._transformDto({ mealDto, dishes, tags }))
      )
    );
  }

  public async createMeal(
    uid: string,
    meal: Partial<Omit<MealDto, 'id' | 'uid'>>
  ): Promise<string> {
    const id = this._apiService.createId();
    const batch = this._apiService.createBatch();
    batch.set(
      this._documentService.getMealDoc(id),
      createMealDto({ id, uid, ...meal }),
    );
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
    const batch = this._apiService.createBatch();
    batch.update(this._documentService.getMealDoc(meal.id), updates);
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
    const batch = this._apiService.createBatch();
    batch.delete(this._documentService.getMealDoc(meal.id));
    batch.updateMultiple([
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
