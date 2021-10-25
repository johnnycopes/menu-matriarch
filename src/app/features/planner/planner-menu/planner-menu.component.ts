import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { MealService } from '@services/meal.service';
import { MenuService } from '@services/menu.service';

@Component({
  selector: 'app-planner-menu',
  templateUrl: './planner-menu.component.html',
  styleUrls: ['./planner-menu.component.scss']
})
export class PlannerMenuComponent implements OnInit, OnDestroy {
  public menu$ = this._menuService.getMenu();
  public menuId$ = this._route.params.pipe(
    map(({ menuId }) => menuId as string),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  public menuName$ = this.menu$.pipe(
    map(menu => menu?.name)
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
  private _routeSubscription = this.menuId$.subscribe(menuId => {
    this._menuService.selectMenu(menuId);
  });

  constructor(
    private _route: ActivatedRoute,
    private _mealService: MealService,
    private _menuService: MenuService,
  ) { }

  ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    this._routeSubscription.unsubscribe();
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
