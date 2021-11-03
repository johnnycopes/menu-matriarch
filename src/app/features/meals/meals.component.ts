import { Component, OnInit } from '@angular/core';
import { IMeal } from '@models/interfaces/meal.interface';

import { MealService } from '@services/meal.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-meals',
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.scss']
})
export class MealsComponent implements OnInit {
  public meals$ = this._mealService.getMeals();
  public trackByFn = trackByFactory<IMeal, string>(meal => meal.id);

  constructor(private _mealService: MealService) { }

  ngOnInit(): void {
  }

}
