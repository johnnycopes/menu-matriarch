import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { first, map, switchMap, tap } from 'rxjs/operators';

import { MealService } from '@services/meal.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-meal-details',
  templateUrl: './meal-details.component.html',
  styleUrls: ['./meal-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealDetailsComponent {
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
  public trackByFn = trackByFactory<string, string>(ingredient => ingredient);

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _mealService: MealService,
  ) { }

  public onDelete(): void {
    this.id$.pipe(
      first(),
      tap(async id => {
        if (!id) {
          return;
        }
        await this._mealService.deleteMeal(id);
      })
    ).subscribe(
      () => this._router.navigate(['..'], { relativeTo: this._route })
    );
  }
}
