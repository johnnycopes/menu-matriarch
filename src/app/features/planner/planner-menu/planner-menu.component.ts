import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, of } from 'rxjs';
import { first, map, switchMap, tap } from 'rxjs/operators';

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
  public menuName$ = this.menu$.pipe(
    map(menu => menu?.name ?? '')
  );
  public menuEntries$ = this.menu$.pipe(
    switchMap(menu => {
      if (!menu) {
        return of([]);
      }
      return this._menuService.getMenuEntries(menu);
    })
  );
  public trackByFn = trackByFactory<IMenuEntry, Day>(menuEntry => menuEntry.day);

  constructor(
    private _menuService: MenuService,
    private _printService: PrintService,
  ) { }

  public onPrint(): void {
    combineLatest([
      this.menuName$,
      this.menuEntries$,
    ]).pipe(
      first(),
      tap(([name, entries]) => this._printService.printMenu(name, entries))
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
