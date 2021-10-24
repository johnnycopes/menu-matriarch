import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';
import { MealService } from '@services/meal.service';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.scss']
})
export class MenusComponent implements OnInit {
  public menus$ = combineLatest([
    this._menuService.getOrderedDays(),
    this._menuService.getMenus(),
    this._mealService.getMeals(),
  ]).pipe(
    map(([days, menus, meals]) => menus.map(
      menu => ({
        ...menu,
        entries: this._menuService.getMenuEntries({ days, menu, meals }),
      })
    ))
  );
  public adding = false;

  constructor(
    private _cdRef: ChangeDetectorRef,
    private _mealService: MealService,
    private _menuService: MenuService,
  ) { }

  ngOnInit(): void {
  }

  public onSave(name: string): void {
    this._menuService
      .createMenu(name)
      .subscribe();
    this.toggleAdding();
  }

  public toggleAdding(): void {
    this.adding = !this.adding;
    this._cdRef.markForCheck();
  }
}
