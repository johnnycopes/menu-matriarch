import { Component, ChangeDetectionStrategy } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { MealService } from '@services/meal.service';
import { UserService } from '@services/user.service';
import { trackById } from '@utility/domain/track-by-functions';

@Component({
  selector: 'app-meals',
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MealsComponent {
  public vm$ = combineLatest([
    this._mealService.getMeals(),
    this._userService.getPreferences(),
  ]).pipe(
    map(([meals, preferences]) => ({
      meals,
      fallbackText: preferences?.emptyMealText ?? '',
      orientation: preferences?.menuOrientation ?? 'horizontal',
    }))
  );
  public readonly trackByFn = trackById;

  constructor(
    private _mealService: MealService,
    private _userService: UserService,
  ) { }
}
