import { Component, OnInit } from '@angular/core';

import { MealService } from '@services/meal.service';
import { AuthService } from '@services/auth.service';
import { MenuService } from '@services/menu.service';
import { IMenuEntry } from '@models/interfaces/menu-entry.interface';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss']
})
export class PlannerComponent implements OnInit {
  public user$ = this._authService.getUser();
  public meals$ = this._mealService.getMeals();
  public menuEntries$ = this._menuService.getMenuEntries();

  constructor(
    private _authService: AuthService,
    private _mealService: MealService,
    private _menuService: MenuService,
  ) {}

  public ngOnInit(): void {
    // this.user$.subscribe(console.log);
    this.meals$.subscribe(console.log);
    this.menuEntries$.subscribe(console.log);
  }

  public onClearDay({ id, day }: IMenuEntry): void {
    this._menuService.updateMenu({ id, day, meal: null });
  }
}
