import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Dish } from '@models/dish.interface';
import { FilteredDishesGroup } from '@models/filtered-dishes.interface';
import { Orientation } from '@models/orientation.type';
import { getDishTypes } from '@shared/utility/domain/get-dish-types';
import { trackByDishType, trackById } from '@utility/domain/track-by-functions';

@Component({
  selector: 'app-meal',
  templateUrl: './meal.component.html',
  styleUrls: ['./meal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealComponent {
  @Input()
  set dishes(dishes: Dish[]) {
    this.dishesGroups = getDishTypes().map(type => ({
      type,
      dishes: dishes.filter(dish => dish.type === type),
    }));
    this.showFallback = !dishes.length;
  }
  @Input() fallbackText = '';
  @Input() orientation: Orientation = 'horizontal';
  public dishesGroups: FilteredDishesGroup[] = [];
  public showFallback = true;
  public readonly groupTrackByFn = trackByDishType;
  public readonly dishTrackByFn = trackById;
}
