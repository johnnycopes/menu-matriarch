import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { MealService } from '@services/meal.service';

@Component({
  selector: 'app-meal-edit',
  templateUrl: './meal-edit.component.html',
  styleUrls: ['./meal-edit.component.scss']
})
export class MealEditComponent {
  public id$ = this._route.paramMap.pipe(
    map(paramMap => paramMap.get('id'))
  );
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
    private _router: Router,
    private _mealService: MealService,
  ) { }

  public onSave(form: NgForm): void {
    this.id$.pipe(
      take(1),
      tap(async id => {
        if (!id) {
          return;
        }
        await this._mealService.updateMeal(id, {
          name: form.value.name,
          description: form.value.description,
        });
      })
    ).subscribe(
      () => this._router.navigate(['..'], { relativeTo: this._route })
    );
  }
}
