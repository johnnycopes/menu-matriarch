import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';
import { UserService } from '@services/user.service';
import { MealService } from '@services/meal.service';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.scss']
})
export class MenusComponent implements OnInit {
  public menus$ = combineLatest([
    this._userService.getUser(),
    this._menuService.getOrderedDays(),
    this._menuService.getMenus(),
    this._mealService.getMeals(),
  ]).pipe(
    map(([user, days, menus, meals]) => menus.map(
      menu => ({
        ...menu,
        selected: user?.selectedMenuId === menu.id,
        entries: this._menuService.getMenuEntries({ days, menu, meals }),
      })
    ))
  );

  constructor(
    private _mealService: MealService,
    private _menuService: MenuService,
    private _userService: UserService,
  ) { }

  ngOnInit(): void {
  }

  public selectMenu(menuId: string): void {
    this._userService.updateUser({
      selectedMenuId: menuId
    });
  }

}
