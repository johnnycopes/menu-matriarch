import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { concatMap, first, tap } from 'rxjs/operators';

import { Ingredient } from '@models/ingredient.interface';
import { IngredientDto } from '@models/dtos/ingredient-dto.interface';
import { AuthService } from './auth.service';
import { IngredientDataService } from './internal/ingredient-data.service';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {

  constructor(
    private _authService: AuthService,
    private _ingredientDataService: IngredientDataService,
  ) { }

  public getIngredient(id: string): Observable<Ingredient | undefined> {
    return this._ingredientDataService.getIngredient(id);
  }

  public getIngredients(): Observable<Ingredient[]> {
    return this._authService.uid$.pipe(
      first(),
      concatMap(uid => {
        if (uid) {
          return this._ingredientDataService.getIngredients(uid);
        }
        return of([]);
      })
    );
  }

  public createIngredient(ingredient: Partial<Omit<IngredientDto, 'id' | 'uid'>>): Observable<string | undefined> {
    return this._authService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = await this._ingredientDataService.createIngredient(uid, ingredient);
          return id;
        } else {
          return undefined;
        }
      })
    );
  }

  public updateIngredient(
    id: string,
    updates: Partial<Omit<IngredientDto, 'usages' | 'menus'>>
  ): Observable<Ingredient | undefined> {
    return this.getIngredient(id).pipe(
      first(),
      tap(async ingredient => {
        if (!ingredient) {
          return;
        }
        await this._ingredientDataService.updateIngredient(ingredient, updates);
      })
    );
  }

  public deleteIngredient(id: string): Observable<Ingredient | undefined> {
    return this.getIngredient(id).pipe(
      first(),
      tap(async ingredient => {
        if (!ingredient) {
          return;
        }
        await this._ingredientDataService.deleteIngredient(ingredient);
      })
    );
  }
}
