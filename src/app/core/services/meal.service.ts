import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { IDish } from '@models/interfaces/dish.interface';
import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { IMenu } from '@models/interfaces/menu.interface';
import { Day } from '@models/types/day.type';
import { Orientation } from '@models/types/orientation.type';
import { DishService } from './dish.service';
import { MenuService } from './menu.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MealService {
  public getMenuEntries(menu: IMenu): Observable<IMenuEntry[]> {
    return combineLatest([
      this._menuService.getOrderedDays(),
      this._dishService.getDishes(),
      this._userService.getPreferences().pipe(
        map(preferences => preferences?.menuOrientation ?? 'horizontal')
      ),
    ]).pipe(
      map(([days, dishes, orientation]) => {
        return this._getMenuEntries({ days, menu, dishes, orientation });
      }),
    );
  }

  private _getMenuEntries({ days, menu, dishes, orientation }: {
    days: Day[],
    menu: IMenu | undefined,
    dishes: IDish[],
    orientation: Orientation
  }): IMenuEntry[] {
    if (!menu) {
      return [];
    }
    return days.map(day => ({
      day,
      orientation,
      dishes: dishes.filter(dish => menu.contents[day].includes(dish.id)),
    }));
  }

  constructor(
    private _dishService: DishService,
    private _menuService: MenuService,
    private _userService: UserService,
  ) { }
}
