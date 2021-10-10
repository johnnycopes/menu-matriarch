import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

import { IMeal } from '../models/interfaces/meal.interface';

@Injectable({
  providedIn: 'root'
})
export class MealService {

  constructor(private _firestore: AngularFirestore) { }

  public getMeals(userId: string): Observable<IMeal[]> {
    return this._firestore
      .collection<IMeal>(
        'meals',
        ref => ref.where('userId', '==', userId)
      )
      .valueChanges();
  }
}
