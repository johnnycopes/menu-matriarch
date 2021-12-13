import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Dish } from '@models/interfaces/dish.interface';
import { FilteredDishesGroup } from '@models/interfaces/filtered-dishes.interface';
import { DishType } from '@models/types/dish-type.type';
import { getDishTypes } from '@models/types/get-dish-types';
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
  public groupTrackByFn = trackByFactory<FilteredDishesGroup, DishType>(group => group.type);
  public dishTrackByFn = trackByFactory<Dish, string>(dish => dish.id);
}
