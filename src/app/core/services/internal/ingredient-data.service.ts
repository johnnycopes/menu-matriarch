import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Endpoint } from '@models/endpoint.enum';
import { Ingredient } from '@models/ingredient.interface';
import { IngredientDto } from '@models/dtos/ingredient-dto.interface';
import { createIngredientDto } from '@utility/domain/create-dtos';
import { lower } from '@utility/generic/format';
import { sort } from '@utility/generic/sort';
import { DataService } from './data.service';
import { DocumentService } from './document.service';

@Injectable({
  providedIn: 'root'
})
export class IngredientDataService {
  private _endpoint = Endpoint.ingredients;

  constructor(
    private _dataService: DataService,
    private _documentService: DocumentService,
  ) { }

  public getIngredient(id: string): Observable<IngredientDto | undefined> {
    return this._dataService.getOne<IngredientDto>(this._endpoint, id);
  }

  public getIngredients(uid: string): Observable<IngredientDto[]> {
    return this._dataService.getMany<IngredientDto>(this._endpoint, uid).pipe(
      map(ingredientDtos =>
        sort(ingredientDtos, ingredientDto => lower(ingredientDto.name))
      )
    );
  }

  public async createIngredient(
    uid: string,
    ingredient: Partial<Omit<IngredientDto, 'id' | 'uid'>>
  ): Promise<string> {
    const id = this._dataService.createId();
    await this._dataService.create<IngredientDto>(
      this._endpoint,
      id,
      createIngredientDto({ id, uid, ...ingredient })
    );
    return id;
  }

  public async updateIngredient(ingredient: Ingredient, updates: Partial<IngredientDto>): Promise<void> {
    const batch = this._dataService.createBatch();
    batch.update(this._documentService.getIngredientDoc(ingredient.id), updates);
    // TODO: update ingredient doc and relevant dishes docs
    await batch.commit();
  }

  public async deleteIngredient(ingredient: Ingredient): Promise<void> {
    const batch = this._dataService.createBatch();
    batch
      .delete(this._documentService.getIngredientDoc(ingredient.id));
      // TODO: update dish docs to remove ingredient
    await batch.commit();
  }
}
