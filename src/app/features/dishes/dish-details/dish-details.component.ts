import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { first, map, switchMap, tap } from 'rxjs/operators';

import { DishService } from '@services/dish.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-dish-details',
  templateUrl: './dish-details.component.html',
  styleUrls: ['./dish-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishDetailsComponent {
  public id$ = this._route.paramMap.pipe(
    map(paramMap => paramMap.get('id'))
  );
  public dish$ = this._route.params.pipe(
    switchMap(({ id }) => {
      if (!id) {
        return of(undefined);
      }
      return this._dishService.getDish(id);
    })
  );
  public trackByFn = trackByFactory<string, string>(ingredient => ingredient);

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _dishService: DishService,
  ) { }

  public onDelete(): void {
    this.id$.pipe(
      first(),
      tap(async id => {
        if (!id) {
          return;
        }
        await this._dishService.deleteDish(id);
      })
    ).subscribe(
      () => this._router.navigate(['..'], { relativeTo: this._route })
    );
  }
}
