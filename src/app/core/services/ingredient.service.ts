import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Ingredient } from '@models/ingredient.interface';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {

  constructor() { }

  public getIngredients(): Observable<Ingredient[]> {
    return of([{
      id: '1',
      uid: 'yPjDo53aeqOpvVbVB6OoKh6V1xD3',
      name: 'Onions',
      type: 'produce',
      dishes: ['PfTtZ9dlbIFNqcS5l3OI'],
    }]);
  }
}
