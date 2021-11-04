import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { IDish } from '@models/interfaces/dish.interface';

import { DishService } from '@services/dish.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-planner-dishes',
  templateUrl: './planner-dishes.component.html',
  styleUrls: ['./planner-dishes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerDishesComponent {
  public dishes$ = this._dishService.getDishes();
  public trackByFn = trackByFactory<IDish, string>(dish => dish.id);

  constructor(private _dishService: DishService) { }
}
