import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '@services/local-storage.service';
import { MenuService } from '@services/menu.service';
import { first, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss']
})
export class PlannerComponent implements OnDestroy {
  private _routeSubscription = this._route.paramMap.pipe(
    map(paramMap => paramMap.get('menuId') ?? ''),
  ).subscribe(menuId => {
    const savedMenuId = this._localStorageService.getMenuId();
    if (menuId) {
      this._menuService.selectMenu(menuId);
    } else if (savedMenuId) {
      this._router.navigate(['/planner', savedMenuId]);
    } else {
      this._menuService.getMenus().pipe(
        first(),
        map(menus => menus[0].id),
        tap(menuId => this._router.navigate(['/planner', menuId])),
      ).subscribe();
    }
  });

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _localStorageService: LocalStorageService,
    private _menuService: MenuService,
  ) {}

  public ngOnDestroy(): void {
    this._routeSubscription.unsubscribe();
  }
}
