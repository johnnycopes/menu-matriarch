import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first, map, tap } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerComponent implements OnDestroy {
  private _routeSubscription = this._route.paramMap.pipe(
    map(paramMap => paramMap.get('menuId') ?? ''),
  ).subscribe(routeMenuId => {
    if (routeMenuId) {
      this._menuService.selectMenu(routeMenuId);
    } else if (this._menuService.savedMenuId) {
      this._router.navigate(['/planner', this._menuService.savedMenuId]);
    } else {
      this._menuService.getMenus().pipe(
        first(),
        map(menus => menus[0].id),
        tap(firstMenuId => this._router.navigate(['/planner', firstMenuId])),
      ).subscribe();
    }
  });

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _menuService: MenuService,
  ) { }

  public ngOnDestroy(): void {
    this._routeSubscription.unsubscribe();
  }
}
