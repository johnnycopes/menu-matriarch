import { Component, Input } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';
import { Day } from '@models/types/day.type';

@Component({
  selector: 'app-meal-card',
  templateUrl: './meal-card.component.html',
  styleUrls: ['./meal-card.component.scss']
})
export class MealCardComponent {
  @Input() id = '';
  @Input() name = '';
  @Input() description = '';
  public days$ = combineLatest([
    this._menuService.getOrderedDays(),
    this._menuService.getMenu().pipe(
      map(menu => menu)
    )
  ]).pipe(
    map(([ days, { id, menu} ]) => days.map(day => ({
      id,
      day,
      checked: menu[day] === this.id
    })))
  );

  constructor(private _menuService: MenuService) {}

  public onChange(state: boolean, id: string, day: Day) {
    this._menuService.updateMenu({ id, day, meal: state ? this.id : null })
  }
}
