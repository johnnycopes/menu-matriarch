import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, of } from 'rxjs';
import { concatMap, first, map, switchMap, tap } from 'rxjs/operators';
import { keyBy } from 'lodash-es';

import { DishService } from '@services/dish.service';
import { MealService } from '@services/meal.service';
import { UserService } from '@services/user.service';
import { trackById, trackBySelf } from '@utility/domain/track-by-functions';
import { getDishTypes } from '@utility/domain/get-dish-types';
import { NgForm } from '@angular/forms';

interface IMealEditForm {
  name: string;
  description: string;
  dishes: string[];
  tags: string[];
}

@Component({
  selector: 'app-meal-edit',
  templateUrl: './meal-edit.component.html',
  styleUrls: ['./meal-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MealEditComponent {
  private _id$ = this._route.paramMap.pipe(
    map(paramMap => paramMap.get('id'))
  );
  public vm$ = combineLatest([
    this._route.params.pipe(
      switchMap(({ id }) => {
        if (!id) {
          return of(undefined);
        }
        return this._mealService.getMeal(id);
      })
    ),
    this._dishService.getDishes(),
    this._userService.getPreferences(),
  ]).pipe(
    map(([meal, dishes, preferences]) => {
      const mealDishesKeyedById = keyBy(meal?.dishes ?? {}, 'id');
        const mealDishesRecord = dishes.reduce((accum, dish) => {
          accum[dish.id] = !!mealDishesKeyedById[dish.id];
          return accum;
        }, {} as Record<string, boolean>);
      const fallbackText = preferences?.emptyMealText ?? '';
      const orientation = preferences?.menuOrientation ?? 'horizontal';
      if (!meal) {
        return {
          name: '',
          description: '',
          dishes: [],
          tags: [],
          mealDishesRecord,
          fallbackText,
          orientation,
        };
      } else {
        return {
          ...meal,
          mealDishesRecord,
          fallbackText,
          orientation,
        };
      }
    })
  );
  public readonly dishTypes = getDishTypes();
  public readonly typeTrackByFn = trackBySelf;
  public readonly dishTrackByFn = trackById;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _dishService: DishService,
    private _mealService: MealService,
    private _userService: UserService,
  ) { }

  public async onSave(form: NgForm): Promise<void> {
    const details: IMealEditForm = {
      name: form.value.name,
      description: form.value.description,
      dishes: form.value.dishes,
      tags: [],
    };
    console.log(details);
    // if (!this._routeId) {
    //   this._dishService.createDish(details).pipe(
    //     tap(newId => this._router.navigate(['..', newId], { relativeTo: this._route }))
    //   ).subscribe();
    // } else {
    //   this.dish$.pipe(
    //     first(),
    //     concatMap(dish => {
    //       if (dish) {
    //         return this._dishService.updateDish(dish.id, details);
    //       } else {
    //         return of(undefined);
    //       }
    //     }),
    //     tap(() => this._router.navigate(['..'], { relativeTo: this._route }))
    //   ).subscribe();
    // }
  }

  // public onMealDishChange(dishId: string): void {
  //   this._id$.pipe(
  //     first(),
  //     tap(mealId => {
  //       this._mealService.updateMeal(mealId, { dishes: })
  //     })
  //   )
  // }
}
