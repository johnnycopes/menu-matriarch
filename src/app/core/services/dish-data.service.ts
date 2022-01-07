import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Dish } from '@models/dish.interface';
import { DishDto } from '@models/dtos/dish-dto.interface';
import { Endpoint } from '@models/endpoint.enum';
import { createDishDto } from '@utility/domain/create-dtos';
import { sort } from '@utility/generic/sort';
import { lower } from '@utility/generic/format';
import { DataService } from './data.service';
import { DocumentService } from './document.service';

@Injectable({
  providedIn: 'root'
})
export class DishDataService {
  private _endpoint = Endpoint.dishes;

  constructor(
    private _dataService: DataService,
    private _documentService: DocumentService
  ) { }

  public getDish(id: string): Observable<DishDto | undefined> {
    return this._dataService.getOne<DishDto>(this._endpoint, id).pipe(
      map(dishDto => {
        if (!dishDto) {
          return undefined;
        }
        return dishDto;
      })
    );
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
    const batch = this._dataService.createBatch();
    batch.set(
      this._documentService.getDishDoc(id),
      createDishDto({ id, uid, ...dish }),
    );
    if (dish.tags) {
      batch.updateMultiple(
        this._documentService.getTagUpdates({
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
    const batch = this._dataService.createBatch();
    batch.update(this._documentService.getDishDoc(dish.id), updates);
    if (updates.tags) {
      batch.updateMultiple(
        this._documentService.getTagUpdates({
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
    const batch = this._dataService.createBatch();
    batch
      .delete(this._documentService.getDishDoc(dish.id))
      .updateMultiple([
        ...this._documentService.getMenuContentsUpdates({
          menuIds: dish.menus,
          dishIds: [dish.id],
          change: 'remove',
        }),
        ...this._documentService.getMealUpdates({
          key: 'dishes',
          initialMealIds: dish.meals,
          finalMealIds: [],
          entityId: dish.id,
        }),
        ...this._documentService.getTagUpdates({
          key: 'dishes',
          initialTagIds: dish.tags.map(tag => tag.id),
          finalTagIds: [],
          entityId: dish.id,
        }),
      ]);
    await batch.commit();
  }
}
