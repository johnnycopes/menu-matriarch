import { Component, OnInit } from '@angular/core';

import { MealService } from '@services/meal.service';

@Component({
  selector: 'app-planner-meals',
  templateUrl: './planner-meals.component.html',
  styleUrls: ['./planner-meals.component.scss']
})
export class PlannerMealsComponent implements OnInit {
  public meals$ = this._mealService.getMeals();

  constructor(private _mealService: MealService) { }

  ngOnInit(): void {
  }

}
