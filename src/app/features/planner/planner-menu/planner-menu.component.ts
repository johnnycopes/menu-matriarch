import { ChangeDetectionStrategy, Component } from '@angular/core';
import { first, tap } from 'rxjs/operators';

import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
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
  public menu$ = this._menuService.getMenu();
  public trackByFn = trackByFactory<IMenuEntry, Day>(menuEntry => menuEntry.day);

  constructor(
    private _menuService: MenuService,
    private _printService: PrintService,
  ) { }

  public onPrint(): void {
    this.menu$.pipe(
      first(),
      tap(menu => {
        if (!menu) {
          return;
        }
        this._printService.printMenu({
          name: menu.name,
          entries: menu.entries,
          fallbackText: menu.fallbackText,
          orientation: menu.orientation,
        });
      })
    ).subscribe();
  }

  public onClearDay({ day }: IMenuEntry): void {
    this._menuService
      .clearMenuContents(day)
      .subscribe();
  }

  public onClearAll(): void {
    this._menuService
      .clearMenuContents()
      .subscribe();
  }
}
