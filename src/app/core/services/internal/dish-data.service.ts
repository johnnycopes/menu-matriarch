import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Dish } from '@models/dish.interface';
import { DishDto } from '@models/dtos/dish-dto.interface';
import { Endpoint } from '@models/endpoint.enum';
import { createDishDto } from '@utility/domain/create-dtos';
import { sort } from '@utility/generic/sort';
import { lower } from '@utility/generic/format';
import { BatchService } from './batch.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class DishDataService {
  private _endpoint = Endpoint.dishes;

  constructor(
    private _batchService: BatchService,
    private _dataService: DataService,
  ) { }

  public getDish(id: string): Observable<DishDto | undefined> {
    return this._dataService.getOne<DishDto>(this._endpoint, id);
  }

  public getDishes(uid: string): Observable<DishDto[]> {
    return this._dataService.getMany<DishDto>(this._endpoint, uid).pipe(
      map(dishDtos => sort(dishDtos, dishDto => lower(dishDto.name)))
    );
  }

  public async createDish({ uid, dish }: {
    uid: string,
    dish: Partial<Omit<DishDto, 'id' | 'uid'>>
  }): Promise<string> {
    const id = this._dataService.createId();
    const batch = this._batchService.createBatch();
    batch.set({
      endpoint: this._endpoint,
      id,
      data: createDishDto({ id, uid, ...dish }),
    });
    if (dish.tags) {
      batch.newUpdateMultiple(
        this._batchService.newGetTagUpdates({
          key: 'dishes',
          initialTagIds: [],
          finalTagIds: dish.tags,
          entityId: id,
        }),
      );
    }
    await batch.commit();
    return id;
  }

  public async updateDish(
    dish: Dish,
    updates: Partial<Omit<DishDto, 'usages' | 'menus'>>
  ): Promise<void> {
    const batch = this._batchService.createBatch();
    batch.update({
      endpoint: this._endpoint,
      id: dish.id,
      updates,
    });
    if (updates.tags) {
      batch.newUpdateMultiple(
        this._batchService.newGetTagUpdates({
          key: 'dishes',
          initialTagIds: dish.tags.map(tag => tag.id),
          finalTagIds: updates.tags,
          entityId: dish.id,
        }),
      );
    }
    await batch.commit();
  }

  public async deleteDish(dish: Dish): Promise<void> {
    const batch = this._batchService.createBatch();
    batch
      .delete(this._endpoint, dish.id)
      .newUpdateMultiple([
        ...this._batchService.newGetMenuContentsUpdates({
          menuIds: dish.menus,
          dishIds: [dish.id],
          change: 'remove',
        }),
        ...this._batchService.newGetMealUpdates({
          key: 'dishes',
          initialMealIds: dish.meals,
          finalMealIds: [],
          entityId: dish.id,
        }),
        ...this._batchService.newGetTagUpdates({
          key: 'dishes',
          initialTagIds: dish.tags.map(tag => tag.id),
          finalTagIds: [],
          entityId: dish.id,
        }),
      ]);
    await batch.commit();
  }
}
