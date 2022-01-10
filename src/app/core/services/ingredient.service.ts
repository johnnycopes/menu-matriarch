import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { concatMap, first } from 'rxjs/operators';

import { Ingredient } from '@models/ingredient.interface';
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
}
