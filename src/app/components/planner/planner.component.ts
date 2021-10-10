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
  public user$ = this._authService.user$;
  public meals$ = this.user$.pipe(
    switchMap(user => {
      const userId = user?.uid;
      if (!userId) {
        return of([]);
      }
      return this._mealService.getMeals(userId);
    })
  );
  public menu$ = this.user$.pipe(
    switchMap(user => {
      const userId = user?.uid;
      if (!userId) {
        return of({});
      }
      return this._menuService.getMenu(userId);
    })
  );
  public preferences$ = this.user$.pipe(
    switchMap(user => {
      const userId = user?.uid;
      if (!userId) {
        return of([]);
      }
      return this._authService.getUser(userId);
    })
  );

  constructor(
    private _authService: AuthService,
    private _mealService: MealService,
    private _menuService: MenuService,
  ) {}

  public ngOnInit(): void {
    this.user$.subscribe(console.log);
    this.meals$.subscribe(console.log);
    this.menu$.subscribe(console.log);
    this.preferences$.subscribe(console.log);
  }
}
