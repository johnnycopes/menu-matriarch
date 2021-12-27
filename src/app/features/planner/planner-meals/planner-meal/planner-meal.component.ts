import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Day } from '@models/day.type';

import { Dish } from '@models/dish.interface';
import { Menu } from '@models/menu.interface';
import { Orientation } from '@models/orientation.type';
import { Tag } from '@models/tag.interface';
import { trackByDay } from '@utility/domain/track-by-functions';

interface EntryModel {
  day: Day;
  checked: boolean;
}

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
  @Input() fallbackText = '';
  @Input() orientation: Orientation = 'horizontal';
  @Input()
  public set menu(menu: Menu | undefined) {
    this.entryModels = menu?.entries.map(entry => {
      return {
        day: entry.day,
        // TODO: write correct states in model
        // checked: !!entry.dishes.find(dish => dish.id === this.id),
        checked: false,
      };
    }) ?? [];
  };
  @Output() dayChange = new EventEmitter<{ dishes: Dish[], day: Day, selected: boolean }>();

  public entryModels: EntryModel[] = [];
  public readonly trackByFn = trackByDay;
}
