import { Component, OnInit } from '@angular/core';

import { MealService } from '@services/meal.service';
import { MenuService } from '@services/menu.service';
import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss']
})
export class PlannerComponent implements OnInit {
  public user$ = this._userService.getUser();
  public meals$ = this._mealService.getMeals();
  public menuEntries$ = this._menuService.getMenuEntries();

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
    this._menuService.updateMenu({ day, mealId: null });
  }
}
