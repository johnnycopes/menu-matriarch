import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { MealService } from '@services/meal.service';
import { MenuService } from '@services/menu.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss']
})
export class PlannerComponent implements OnInit {
  public user$ = this._userService.getUser();
  public meals$ = this._mealService.getMeals();
  public menuName$ = this._menuService.getMenu().pipe(
    map(menu => menu?.name)
  );
  public menuEntries$ = combineLatest([
    this._menuService.getOrderedDays(),
    this._menuService.getMenu(),
    this._mealService.getMeals(),
  ]).pipe(
    map(([days, menu, meals]) => this._menuService.getMenuEntries({ days, menu, meals }))
  );

  constructor(
    private _mealService: MealService,
    private _menuService: MenuService,
    private _userService: UserService,
  ) {}

  public ngOnInit(): void {
    // this.user$.subscribe(console.log);
    // this.meals$.subscribe(console.log);
    // this.menuEntries$.subscribe(console.log);
  }

  public onClearDay({ day }: IMenuEntry): void {
    this._menuService
      .updateMenu({ day, mealId: null })
      .subscribe();
  }
}
