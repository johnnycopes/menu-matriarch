import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { Day } from '@models/types/day.type';
import { MealService } from '@services/meal.service';
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
  public menuEntries$ = combineLatest([
    this.menu$,
    this._menuService.getOrderedDays(),
    this._mealService.getMeals(),
  ]).pipe(
    map(([menu, days, meals]) => {
      return this._menuService.getMenuEntries({ days, menu, meals });
    })
  );
  public trackByFn = trackByFactory<IMenuEntry, Day>(menuEntry => menuEntry.day);

  constructor(
    private _mealService: MealService,
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
      .updateMenuContents({ day, mealId: null })
      .subscribe();
  }

  public onClearAll(): void {
    this._menuService
      .clearMenuContents()
      .subscribe();
  }
}
