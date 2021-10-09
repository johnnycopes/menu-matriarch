import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { MealService } from 'src/app/services/meal.service';
import { AuthService } from 'src/app/services/auth.service';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss']
})
export class PlannerComponent implements OnInit {
  public user$ = this._userService.user$;
  public meals$ = this.user$.pipe(
    switchMap(user => {
      const userId = user?.uid;
      if (!userId) {
        return of([]);
      }
      return this._mealService.getMeals(userId);
    })
  );
  public menu$ = this._menuService.getMenu();

  constructor(
    private _mealService: MealService,
    private _menuService: MenuService,
    private _userService: AuthService,
  ) {}

  public ngOnInit(): void {
    this.user$.subscribe(console.log);
    this.meals$.subscribe(console.log);
    this.menu$.subscribe(console.log);
  }
}
