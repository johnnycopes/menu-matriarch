import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { concatMap, first, map, switchMap, tap } from 'rxjs/operators';

import { trackById, trackBySelf } from '@utility/domain/track-by-functions';
import { MealService } from '@services/meal.service';
import { getDishTypes } from '@shared/utility/domain/get-dish-types';

@Component({
  selector: 'app-meal-details',
  templateUrl: './meal-details.component.html',
  styleUrls: ['./meal-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealDetailsComponent {
  private _id$ = this._route.paramMap.pipe(
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
  public readonly dishTypes = getDishTypes();
  public readonly typeTrackByFn = trackBySelf;
  public readonly dishTrackByFn = trackById;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _mealService: MealService
  ) { }

  // public onDelete(): void {
  //   this._id$.pipe(
  //     first(),
  //     concatMap(id => {
  //       if (!id) {
  //         return of(undefined);
  //       }
  //       return this._mealService.deleteDish(id);
  //     }),
  //     tap(() => this._router.navigate(['..'], { relativeTo: this._route }))
  //   ).subscribe();
  // }
}
