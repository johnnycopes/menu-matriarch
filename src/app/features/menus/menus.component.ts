import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, merge, Subject } from 'rxjs';
import { map, mapTo, shareReplay } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';
import { DishService } from '@services/dish.service';
import { IMenu } from '@models/interfaces/menu.interface';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenusComponent {
  public menus$ = combineLatest([
    this._menuService.getOrderedDays(),
    this._menuService.getMenus(),
    this._dishService.getDishes(),
  ]).pipe(
    map(([days, menus, dishes]) => menus.map(
      menu => ({
        ...menu,
        entries: this._menuService.getMenuEntries({ days, menu, dishes }),
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

  constructor(
    private _dishService: DishService,
    private _menuService: MenuService,
  ) { }

  public onSave(name: string): void {
    this._menuService
      .createMenu(name)
      .subscribe();
    this.finishAdd$.next();
  }
}
