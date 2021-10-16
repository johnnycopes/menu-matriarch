import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { combineLatest, Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { IMenu } from '@models/interfaces/menu.interface';
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
      this._mealService.getMeals(),
      this.getMenu(),
      this.getOrderedDays(),
    ]).pipe(
      map(([meals, menu, days]) => {
        if (!menu) {
          return [];
        }
        return days.map(day => ({
          day,
          meal: meals.find(meal => meal.id === menu.contents[day]),
        }));
      })
    );
  }

  public getMenu(): Observable<IMenu | undefined> {
    return this._authService.getData(this._getMenu);
  }

  public getMenus(): Observable<IMenu[]> {
    return this._authService.getData(this._getMenus);
  }

  public async updateMenu({ day, mealId }: {
    day: Day,
    mealId: string | null
  }): Promise<void> {
    this._updateMenu({
      menuId: 'KuiR3kwmeYdebwd5u1dY', // TODO: pass this in dynamically
      day,
      mealId,
    })
  }

  public getOrderedDays(): Observable<Day[]> {
    return this._authService.getUser().pipe(
      map(user => this._getOrderedDays(user?.preferences?.menuStartDay)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private _getMenus = (uid?: string): Observable<IMenu[]> => {
    if (!uid) {
      return of([]);
    }
    return this._firestore
      .collection<IMenu>(
        'menus',
        ref => ref.where('uid', '==', uid),
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  private _getMenu = (uid?: string): Observable<IMenu | undefined> => {
    if (!uid) {
      return of();
    }
    return this._firestore
      .collection<IMenu>(
        'menus',
        ref => ref.where('uid', '==', uid),
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map(menus => menus?.[0]),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  private _updateMenu = async ({ menuId, day, mealId }: {
    menuId: string,
    day: Day,
    mealId: string | null
  }): Promise<void> => {
    const key = `contents.${day}`;
    console.log({ menuId, day, mealId });
    await this._firestore
      .collection<IMenu>('menus')
      .doc(menuId)
      .ref
      .update({ [key]: mealId });
  }

  private _getOrderedDays(startDay: Day = 'Monday'): Day[] {
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
