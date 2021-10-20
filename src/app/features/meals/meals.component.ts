import { Component, OnInit } from '@angular/core';

import { MealService } from '@services/meal.service';

@Component({
  selector: 'app-meals',
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.scss']
})
export class MealsComponent implements OnInit {
  public meals$ = this._mealService.getMeals();

  constructor(private _mealService: MealService) { }

  ngOnInit(): void {
  }

}
