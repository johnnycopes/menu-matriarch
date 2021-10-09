import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

import { IUser } from '../models/user.interface';
import { IMeal } from '../models/meal.interface';

@Injectable({
  providedIn: 'root'
})
export class MealService {

  constructor(private _firestore: AngularFirestore) { }

  public getMeals(id: string): Observable<IMeal[]> {
    return this._firestore
      .collection<IUser>('users')
      .doc(id)
      .collection<IMeal>('meals')
      .valueChanges();
  }
}
