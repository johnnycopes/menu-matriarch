import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, shareReplay, take, tap } from 'rxjs/operators';

import { IMeal } from '@models/interfaces/meal.interface';
import { IMenu } from '@models/interfaces/menu.interface';
import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { Day } from '@models/types/day.type';
import { FirestoreService } from './firestore.service';
import { LocalStorageService } from './local-storage.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(
    private _firestoreService: FirestoreService,
    private _localStorageService: LocalStorageService,
    private _userService: UserService,
  ) { }

  public getMenuEntries({ days, meals, menu }: {
    days: Day[],
    menu: IMenu | undefined,
    meals: IMeal[],
  }): IMenuEntry[] {
    if (!menu) {
      return [];
    }
    return days.map(day => ({
      day,
      meal: meals.find(meal => meal.id === menu.contents[day]),
    }));
  }

  public getMenu(): Observable<IMenu | undefined> {
    return combineLatest([
      this.getMenus(),
      this._userService.getUser(),
    ]).pipe(
      map(([menus, user]) => menus.find(menu => menu.id === user?.selectedMenuId)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  public getMenuNew(id?: string): Observable<IMenu | undefined> {
    const menuId = id ?? this._localStorageService.getMenuId();
    return this._firestoreService.getMenu(menuId ?? '');
  }

  public getMenus(): Observable<IMenu[]> {
    return this._userService.getData(this._firestoreService.getMenus);
  }

  public updateMenu({ day, mealId }: {
    day: Day,
    mealId: string | null
  }): Observable<string | undefined> {
    return this.getMenu().pipe(
      take(1),
      map(menu => menu?.id),
      tap(menuId => {
        if (!menuId) {
          throw new Error('Cannot perform update because no menu is selected');
        }
        this._firestoreService.updateMenu({
          menuId,
          day,
          mealId,
        });
      })
    );
  }

  public getOrderedDays(): Observable<Day[]> {
    return this._userService.getUser().pipe(
      map(user => this._getOrderedDays(user?.preferences?.menuStartDay)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
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
