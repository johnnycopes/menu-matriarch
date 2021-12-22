import { Component, ChangeDetectionStrategy } from '@angular/core';

import { MealService } from '@services/meal.service';
import { trackById } from '@utility/domain/track-by-functions';

@Component({
  selector: 'app-meals',
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MealsComponent {
  public meals$ = this._mealService.getMeals();
  public readonly trackByFn = trackById;

  constructor(private _mealService: MealService) { }
}
