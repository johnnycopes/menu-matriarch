import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { Menu } from '@models/interfaces/menu.interface';
import { Tag } from '@models/interfaces/tag.interface';
import { DishType } from '@models/types/dish-type.type';
import { Day } from '@models/types/day.type';
import { trackByFactory } from '@shared/utility/track-by-factory';

interface EntryModel {
  day: Day;
  checked: boolean;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-planner-dish]',
  templateUrl: './planner-dish.component.html',
  styleUrls: ['./planner-dish.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerDishComponent {
  @Input() id = '';
  @Input() name = '';
  @Input() description = '';
  @Input() link = '';
  @Input() type: DishType = 'main';
  @Input() tags: Tag[] = [];
  @Input() menus: string[] = [];
  @Input() usages: number = 0;
  @Input()
  public set menu(menu: Menu | undefined) {
    this.entryModels = menu?.entries.map(entry => ({
      day: entry.day,
      checked: !!entry.dishes.find(dish => dish.id === this.id),
    })) ?? [];
  };
  @Output() dayChange = new EventEmitter<{ id: string, day: Day, selected: boolean }>();

  public entryModels: EntryModel[] = [];
  public trackByFn = trackByFactory<EntryModel, Day>(model => model.day);
}
