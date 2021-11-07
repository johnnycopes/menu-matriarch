import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { IDish } from '@models/interfaces/dish.interface';
import { DishService } from '@services/dish.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-dishes',
  templateUrl: './dishes.component.html',
  styleUrls: ['./dishes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishesComponent {
  public vm$ = combineLatest([
    this._dishService.getDishes(),
    of(this._route.snapshot.firstChild?.params.id),
  ]).pipe(
    map(([dishes, routeId]) => {
      return {
        total: dishes.length,
        mains: dishes.filter(dish => dish.type === 'main'),
        sides: dishes.filter(dish => dish.type === 'side'),
        initialTab: dishes
          .find(dish => dish.id === routeId)
          ?.type ?? 'main',
      };
    })
  );
  public trackByFn = trackByFactory<IDish, string>(dish => dish.id);

  constructor(
    private _route: ActivatedRoute,
    private _dishService: DishService,
  ) { }
}
