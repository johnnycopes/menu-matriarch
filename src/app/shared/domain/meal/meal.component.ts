import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { IDish } from '@models/interfaces/dish.interface';
import { Orientation } from '@models/types/orientation.type';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-meal',
  templateUrl: './meal.component.html',
  styleUrls: ['./meal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealComponent {
  @Input()
  set dishes(dishes: IDish[]) {
    this.mains = dishes.filter(dish => dish.type === 'main');
    this.sides = dishes.filter(dish => dish.type === 'side');
    this.showFallback = !dishes.length;
  }
  @Input() fallbackText = '';
  @Input() orientation: Orientation = 'horizontal';
  public mains: IDish[] = [];
  public sides: IDish[] = [];
  public showFallback = true;
  public trackByFn = trackByFactory<IDish, string>(dish => dish.id);
}
