import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, of } from 'rxjs';
import { concatMap, first, map, switchMap, tap } from 'rxjs/operators';

import { MealService } from '@services/meal.service';
import { UserService } from '@services/user.service';
import { trackById, trackBySelf } from '@utility/domain/track-by-functions';
import { getDishTypes } from '@utility/domain/get-dish-types';

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
    this._userService.getPreferences(),
  ]).pipe(
    map(([meal, preferences]) => ({
      meal,
      fallbackText: preferences?.emptyMealText ?? '',
      orientation: preferences?.menuOrientation ?? 'horizontal',
    }))
  );
  public readonly dishTypes = getDishTypes();
  public readonly typeTrackByFn = trackBySelf;
  public readonly dishTrackByFn = trackById;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _mealService: MealService,
    private _userService: UserService,
  ) { }
}
