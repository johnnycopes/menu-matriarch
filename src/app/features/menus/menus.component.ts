import { Component, ElementRef, ViewChild } from '@angular/core';
import { combineLatest, merge, Subject } from 'rxjs';
import { map, mapTo, shareReplay } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';
import { MealService } from '@services/meal.service';
import { ButtonComponent } from '@shared/generic/button/button.component';
import { IMenu } from '@models/interfaces/menu.interface';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.scss']
})
export class MenusComponent {
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
  public startAdd$ = new Subject<void>();
  public finishAdd$ = new Subject<void>();
  public adding$ = merge(
    this.startAdd$.pipe(mapTo(true)),
    this.finishAdd$.pipe(mapTo(false)),
  ).pipe(
    shareReplay({ refCount: true, bufferSize: 1 })
  );
  public trackByFn = trackByFactory<IMenu, string>(menu => menu.id);

  @ViewChild(ButtonComponent, { read: ElementRef, static: true })
  public buttonRef: ElementRef<HTMLButtonElement> | undefined;

  constructor(
    private _mealService: MealService,
    private _menuService: MenuService,
  ) { }

  public onSave(name: string): void {
    this._menuService
      .createMenu(name)
      .subscribe();
    this.finishAdd$.next();
  }
}
