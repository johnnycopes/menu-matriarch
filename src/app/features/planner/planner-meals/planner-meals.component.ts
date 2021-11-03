import { Component, OnInit } from '@angular/core';
import { IMeal } from '@models/interfaces/meal.interface';

import { MealService } from '@services/meal.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-planner-meals',
  templateUrl: './planner-meals.component.html',
  styleUrls: ['./planner-meals.component.scss']
})
export class PlannerMealsComponent implements OnInit {
  public meals$ = this._mealService.getMeals();
  public trackByFn = trackByFactory<IMeal, string>(meal => meal.id);

  constructor(private _mealService: MealService) { }

  ngOnInit(): void {
  }

}
