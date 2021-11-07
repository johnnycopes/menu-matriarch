import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IDish } from '@models/interfaces/dish.interface';

import { DishService } from '@services/dish.service';
import { trackByFactory } from '@shared/utility/track-by-factory';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dishes',
  templateUrl: './dishes.component.html',
  styleUrls: ['./dishes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishesComponent {
  public vm$ = this._dishService.getDishes().pipe(
    map(dishes => ({
      total: dishes.length,
      mains: dishes.filter(dish => dish.type === 'main'),
      sides: dishes.filter(dish => dish.type === 'side'),
    }))
  );
  public trackByFn = trackByFactory<IDish, string>(dish => dish.id);

  constructor(private _dishService: DishService) { }
}
