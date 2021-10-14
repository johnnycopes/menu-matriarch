import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { IMeal } from '@models/interfaces/meal.interface';
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
    return this._authService.getData(this._getMeals);
  }

  private _getMeals = (uid?: string): Observable<IMeal[]> => {
    if (!uid) {
      return of([]);
    }
    return this._firestore
      .collection<IMeal>(
        'meals',
        ref => ref.where('uid', '==', uid)
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }
}
