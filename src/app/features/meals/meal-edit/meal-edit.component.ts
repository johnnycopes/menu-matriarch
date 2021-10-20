import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { MealService } from '@services/meal.service';

@Component({
  selector: 'app-meal-edit',
  templateUrl: './meal-edit.component.html',
  styleUrls: ['./meal-edit.component.scss']
})
export class MealEditComponent implements OnInit {
  public meal$ = this._route.params.pipe(
    switchMap(({ id }) => {
      if (!id) {
        return of(undefined);
      }
      return this._mealService.getMeal(id);
    })
  );

  constructor(
    private _route: ActivatedRoute,
    private _mealService: MealService,
  ) { }

  ngOnInit(): void {
  }

  public onSave(form: NgForm): void {
    console.log(form.value)
  }

}
