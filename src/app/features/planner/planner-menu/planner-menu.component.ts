import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

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
  private _routeSubscription = this._route.params.pipe(
    map(({ menuId }) => menuId),
  ).subscribe(menuId => {
    if (menuId) {
      this._menuService.updateMenuId(menuId);
    }
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
      .updateMenu({ day, mealId: null })
      .subscribe();
  }
}
