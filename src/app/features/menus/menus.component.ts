import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, merge, Subject } from 'rxjs';
import { mapTo, shareReplay, switchMap } from 'rxjs/operators';

import { IMenuDisplay } from '@models/interfaces/menu-display.interface';
import { MenuService } from '@services/menu.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenusComponent {
  public menus$ = this._menuService.getMenus().pipe(
    switchMap(menus => combineLatest(
      menus.map(menu => this._menuService.getMenuDisplay(menu))
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
  public trackByFn = trackByFactory<IMenuDisplay, string>(menu => menu.id);

  constructor(private _menuService: MenuService) { }

  public onSave(name: string): void {
    this._menuService
      .createMenu(name)
      .subscribe();
    this.finishAdd$.next();
  }
}
