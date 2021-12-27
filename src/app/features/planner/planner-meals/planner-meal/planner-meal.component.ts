import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { Dish } from '@models/dish.interface';
import { Orientation } from '@models/orientation.type';
import { Tag } from '@models/tag.interface';

@Component({
  selector: 'app-planner-meal',
  templateUrl: './planner-meal.component.html',
  styleUrls: ['./planner-meal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlannerMealComponent {
  @Input() id = '';
  @Input() name = '';
  @Input() description = '';
  @Input() dishes: Dish[] = [];
  @Input() tags: Tag[] = [];
  @Input() active = false;
  @Input() fallbackText = '';
  @Input() orientation: Orientation = 'horizontal';
}
