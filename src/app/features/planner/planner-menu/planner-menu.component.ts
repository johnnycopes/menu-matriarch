import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Menu } from '@models/interfaces/menu.interface';
import { MenuEntry } from '@models/interfaces/menu-entry.interface';
import { Day } from '@models/types/day.type';
import { MenuService } from '@services/menu.service';
import { PrintService } from '@services/print.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-planner-menu',
  templateUrl: './planner-menu.component.html',
  styleUrls: ['./planner-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerMenuComponent {
  public menu$ = this._route.params.pipe(
    switchMap(({ menuId }) => {
      if (!menuId) {
        return of(undefined);
      }
      return this._menuService.getMenu(menuId);
    })
  );
  public trackByFn = trackByFactory<MenuEntry, Day>(menuEntry => menuEntry.day);

  constructor(
    private _route: ActivatedRoute,
    private _menuService: MenuService,
    private _printService: PrintService,
  ) { }

  public onPrint(menu: Menu | undefined): void {
    if (!menu) {
      return;
    }
    this._printService.printMenu({
      name: menu.name,
      entries: menu.entries,
      fallbackText: menu.fallbackText,
      orientation: menu.orientation,
    });
  }

  public async onClearDay(menu: Menu | undefined, { day }: MenuEntry): Promise<void> {
    if (!menu) {
      return;
    }
    return this._menuService.deleteMenuContents(menu, day);
  }

  public async onClearAll(menu: Menu | undefined): Promise<void> {
    if (!menu) {
      return;
    }
    return this._menuService.deleteMenuContents(menu);
  }
}
