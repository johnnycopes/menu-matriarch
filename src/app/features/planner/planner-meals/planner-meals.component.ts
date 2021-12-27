import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { Day } from '@models/day.type';
import { Dish } from '@models/dish.interface';
import { Menu } from '@models/menu.interface';
import { MenuService } from '@services/menu.service';

@Component({
  selector: 'app-planner-meals',
  templateUrl: './planner-meals.component.html',
  styleUrls: ['./planner-meals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlannerMealsComponent {
  @Input() menu: Menu | undefined;
  @Output() nameDblClick = new EventEmitter<void>();

  constructor (private _menuService: MenuService) { }

  public async onDayChange(
    menu: Menu | undefined,
    { dishes, day, selected }: { dishes: Dish[], day: Day, selected: boolean }
  ): Promise<void> {
    if (!menu) {
      return;
    }
    return this._menuService.updateMenuContents({
      menu,
      dishIds: dishes.map(dish => dish.id),
      day,
      selected
    });
  }
}
