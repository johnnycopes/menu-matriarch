import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, merge, Subject } from 'rxjs';
import { map, mapTo, shareReplay, switchMap } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';
import { IMenu } from '@models/interfaces/menu.interface';
import { trackByFactory } from '@shared/utility/track-by-factory';
import { MealService } from '@services/meal.service';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenusComponent {
  public menus$ = combineLatest([
    this._menuService.getMenus(),
    this._menuService.getMenus().pipe(
      switchMap(menus => combineLatest(
        menus.map(menu => this._mealService.getMenuEntries(menu))
      ))
    )
  ]).pipe(
    map(([menus, menusEntries]) => {
      return menus.map((menu, index) => ({ ...menu, entries: menusEntries[index] }))
    })
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
