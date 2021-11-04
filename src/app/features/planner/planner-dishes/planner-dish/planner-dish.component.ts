import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';
import { Day } from '@models/types/day.type';
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
  public dayModels$: Observable<IDayModel[]> = combineLatest([
    this._menuService.getOrderedDays(),
    this._menuService.getMenu().pipe(
      map(menu => menu)
    )
  ]).pipe(
    map(([days, menu]) => days.map(day => ({
      day,
      checked: menu?.contents?.[day] === this.id
    })))
  );
  public trackByFn = trackByFactory<IDayModel, Day>(model => model.day);

  constructor(private _menuService: MenuService) {}

  public onChange(selected: boolean, day: Day): void {
    this._menuService
      .updateMenuContents({ day, dishId: selected ? this.id : null })
      .subscribe();
  }
}