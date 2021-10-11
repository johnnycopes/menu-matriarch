import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { IMeal } from '../models/interfaces/meal.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MealService {

  constructor(
    private _firestore: AngularFirestore,
    private _authService: AuthService,
  ) { }

  public getMeals(): Observable<IMeal[]> {
    return this._authService.uid$.pipe(
      switchMap(uid => {
        return this._firestore
          .collection<IMeal>(
            'meals',
            ref => ref.where('uid', '==', uid)
          )
          .valueChanges({ idField: 'id' });
      })
    );
  }
}
