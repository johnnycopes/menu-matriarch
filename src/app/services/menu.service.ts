import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { IMenu, IMenuDbo, IMenuEntry } from '../models/interfaces/menu.interface';
import { Day } from '../models/types/day.type';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(
    private _firestore: AngularFirestore,
    private _authService: AuthService,
  ) { }

  public getMenuEntries(): Observable<IMenuEntry[]> {
    return combineLatest([
      this._getMenu(),
      this._authService.getUser(),
    ]).pipe(
      map(([menu, user]) => {
        if (!menu || !user) {
          return [];
        }
        const days = this._getOrderedDays(user.preferences.menuStartDay);
        return days.map(day => ({ day, meal: menu[day] }));
      })
    );
  }

  private _getMenu(): Observable<IMenu | undefined> {
    return this._authService.uid$.pipe(
      switchMap(uid => {
        return this._firestore
          .collection<IMenuDbo>(
            'menus',
            ref => ref.where('uid', '==', uid),
          )
          .valueChanges()
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
