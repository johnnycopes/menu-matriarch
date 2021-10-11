import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { IMenu, Menu } from '@models/interfaces/menu.interface';
import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { Day } from '@models/types/day.type';
import { AuthService } from './auth.service';
import { MealService } from './meal.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(
    private _firestore: AngularFirestore,
    private _authService: AuthService,
    private _mealService: MealService,
  ) { }

  public getMenuEntries(): Observable<IMenuEntry[]> {
    return combineLatest([
      this._authService.getUser(),
      this._mealService.getMeals(),
      this._getMenu(),
    ]).pipe(
      map(([user, meals, menu]) => {
        if (!menu || !user) {
          return [];
        }
        const days = this._getOrderedDays(user.preferences.menuStartDay);
        console.log(meals);
        return days.map(day => ({ day, meal: meals.find(meal => meal.id === menu[day]) }));
      })
    );
  }

  private _getMenu(): Observable<Menu> {
    return this._authService.uid$.pipe(
      switchMap(uid => {
        return this._firestore
          .collection<IMenu>(
            'menus',
            ref => ref.where('uid', '==', uid),
          )
          .valueChanges({ idField: 'id' })
          .pipe(
            map(menus => menus?.[0]?.menu)
          );
      })
    );
  }

  private _getOrderedDays(startDay: Day): Day[] {
    switch (startDay) {
      case 'Monday':
        return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      case 'Tuesday':
        return ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'];
      case 'Wednesday':
        return ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday'];
      case 'Thursday':
        return ['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'];
      case 'Friday':
        return ['Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
      case 'Saturday':
        return ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      case 'Sunday':
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    }
  }
}