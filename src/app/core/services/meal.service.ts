import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IMeal } from '@models/interfaces/meal.interface';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class MealService {

  constructor(
    private _authService: AuthService,
    private _firestoreService: FirestoreService,
  ) { }

  public getMeals(): Observable<IMeal[]> {
    return this._authService.getData(this._firestoreService.getMeals);
  }
}
