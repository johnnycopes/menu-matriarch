import { Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { first, map, shareReplay, take } from 'rxjs/operators';

import { IMenu } from '@models/interfaces/menu.interface';
import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { Day } from '@models/types/day.type';
import { FirestoreService } from './firestore.service';
import { MealService } from './meal.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(
    private _firestoreService: FirestoreService,
    private _mealService: MealService,
    private _userService: UserService,
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
    return combineLatest([
      this.getMenus(),
      this._userService.getUser(),
    ]).pipe(
      map(([menus, user]) => menus.find(menu => menu.id === user?.selectedMenuId)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  public getMenus(): Observable<IMenu[]> {
    return this._userService.getData(this._firestoreService.getMenus);
  }

  public async updateMenu({ day, mealId }: {
    day: Day,
    mealId: string | null
  }): Promise<void> {
    this.getMenu().pipe(
      take(1),
      map(menu => menu?.id)
    ).subscribe(menuId => {
      if (!menuId) {
        throw new Error('Cannot perform update because no menu is selected');
      }
      this._firestoreService.updateMenu({
        menuId,
        day,
        mealId,
      });
    });
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
