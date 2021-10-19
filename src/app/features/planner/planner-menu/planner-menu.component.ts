import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { LocalStorageService } from '@services/local-storage.service';
import { MealService } from '@services/meal.service';
import { MenuService } from '@services/menu.service';
import { UserService } from '@services/user.service';
import { combineLatest } from 'rxjs';
import { map, tap, shareReplay, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-planner-menu',
  templateUrl: './planner-menu.component.html',
  styleUrls: ['./planner-menu.component.scss']
})
export class PlannerMenuComponent implements OnInit {
  public menuId$ = this._route.params.pipe(
    map(({ menuId }) => menuId),
    tap((menuId: string) => {
      if (menuId) {
        this._localStorageService.setMenuId(menuId);
      }
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  public menu$ = this.menuId$.pipe(
    switchMap(id => this._menuService.getMenuNew(id)),
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

  constructor(
    private _route: ActivatedRoute,
    private _localStorageService: LocalStorageService,
    private _mealService: MealService,
    private _menuService: MenuService,
  ) { }

  ngOnInit(): void {
  }

  public onClearDay({ day }: IMenuEntry): void {
    this._menuService
      .updateMenu({ day, mealId: null })
      .subscribe();
  }
}
