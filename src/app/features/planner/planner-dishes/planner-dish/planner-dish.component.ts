import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Tag } from '@models/interfaces/tag.interface';
import { DishType } from '@models/types/dish-type.type';
import { Day } from '@models/types/day.type';
import { MenuService } from '@services/menu.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

interface EntryModel {
  day: Day;
  checked: boolean;
}

@Component({
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
  public entryModels$: Observable<EntryModel[]> = this._menuService.getMenu().pipe(
    map(menu => (menu?.entries ?? []).map(entry => ({
      day: entry.day,
      checked: !!entry.dishes.find(dish => dish.id === this.id),
    })))
  );
  public trackByFn = trackByFactory<EntryModel, Day>(model => model.day);

  constructor(private _menuService: MenuService) {}

  public onChange(selected: boolean, day: Day): void {
    this._menuService
      .updateMenuContents({
        day,
        dishId: this.id,
        selected,
      })
      .subscribe();
  }
}
