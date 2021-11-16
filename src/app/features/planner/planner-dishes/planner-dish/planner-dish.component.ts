import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ITag } from '@models/interfaces/tag.interface';
import { DishType } from '@models/types/dish-type.type';
import { Day } from '@models/types/day.type';
import { MenuService } from '@services/menu.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

interface IDayModel {
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
  @Input() type: DishType = 'main';
  @Input() tags: ITag[] = [];
  @Input() menus: string[] = [];
  @Input() usages: number = 0;
  public dayModels$: Observable<IDayModel[]> = this._menuService.getMenu().pipe(
    map(menu => (menu?.entries ?? []).map(entry => ({
      day: entry.day,
      checked: !!entry.dishes.find(dish => dish.id === this.id),
    })))
  );
  public trackByFn = trackByFactory<IDayModel, Day>(model => model.day);

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
