import { Component, Input } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';
import { Day } from '@models/types/day.type';

@Component({
  selector: '[app-planner-meal]',
  templateUrl: './planner-meal.component.html',
  styleUrls: ['./planner-meal.component.scss']
})
export class PlannerMealComponent {
  @Input() id = '';
  @Input() name = '';
  @Input() description = '';
  public days$ = combineLatest([
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

  constructor(private _menuService: MenuService) {}

  public onChange(state: boolean, day: Day): void {
    this._menuService
      .updateMenu({ day, mealId: state ? this.id : null })
      .subscribe();
  }
}
