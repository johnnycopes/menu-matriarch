import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

import { IMeal, IMealDbo } from '../models/interfaces/meal.interface';

@Injectable({
  providedIn: 'root'
})
export class MealService {

  constructor(private _firestore: AngularFirestore) { }

  public getMeals(uid: string): Observable<IMeal[]> {
    return this._firestore
      .collection<IMealDbo>(
        'meals',
        ref => ref.where('uid', '==', uid)
      )
      .valueChanges();
  }
}
