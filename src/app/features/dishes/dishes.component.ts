import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  public dishes$ = this._dishService.getDishes();
  public trackByFn = trackByFactory<IDish, string>(dish => dish.id);

  constructor(private _dishService: DishService) { }
}
