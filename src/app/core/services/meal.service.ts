import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first, switchMap, tap } from 'rxjs/operators';

import { IMeal } from '@models/interfaces/meal.interface';
import { FirestoreService } from './firestore.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MealService {
  private _endpoint = 'meals';

  constructor(
    private _firestoreService: FirestoreService,
    private _userService: UserService,
  ) { }

  public getMeal(id: string): Observable<IMeal | undefined> {
    return this._firestoreService.getOne<IMeal>(this._endpoint, id);
  }

  public createMeal(info: Partial<IMeal>): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      tap(async uid => {
        if (uid) {
          await this._firestoreService.createMeal(uid, info);
        }
      })
    );
  }

  public updateMeal(id: string, updates: Partial<IMeal>): Promise<void> {
    return this._firestoreService.update<IMeal>(this._endpoint, id, updates);
  }

  public deleteMeal(id: string): Promise<void> {
    return this._firestoreService.delete<IMeal>(this._endpoint, id);
  }

  public getMeals(): Observable<IMeal[]> {
    return this._userService.uid$.pipe(
      switchMap(uid => this._firestoreService.getMany<IMeal>(this._endpoint, uid))
    );
  }
}
