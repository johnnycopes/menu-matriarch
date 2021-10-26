import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { MealService } from '@services/meal.service';
import { MenuService } from '@services/menu.service';
import { PrintService } from '@services/print.service';

@Component({
  selector: 'app-planner-menu',
  templateUrl: './planner-menu.component.html',
  styleUrls: ['./planner-menu.component.scss']
})
export class PlannerMenuComponent implements OnInit, OnDestroy {
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
  private _routeSubscription = this._route.params.pipe(
    map(({ menuId }) => menuId as string)
  ).subscribe(menuId => {
    this._menuService.selectMenu(menuId);
  });

  constructor(
    private _route: ActivatedRoute,
    private _mealService: MealService,
    private _menuService: MenuService,
    private _printService: PrintService,
  ) { }

  ngOnInit(): void {
    this._route.queryParams.subscribe(console.log);
  }

  public ngOnDestroy(): void {
    this._routeSubscription.unsubscribe();
  }

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
