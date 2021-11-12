import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IDish } from '@models/interfaces/dish.interface';

import { DishService } from '@services/dish.service';
import { trackByFactory } from '@shared/utility/track-by-factory';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-planner-dishes',
  templateUrl: './planner-dishes.component.html',
  styleUrls: ['./planner-dishes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerDishesComponent {
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
