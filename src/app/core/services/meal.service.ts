import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IMeal } from '@models/interfaces/meal.interface';
import { FirestoreService } from './firestore.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MealService {

  constructor(
    private _firestoreService: FirestoreService,
    private _userService: UserService,
  ) { }

  public getMeals(): Observable<IMeal[]> {
    return this._userService.getData(this._firestoreService.getMeals);
  }
}
