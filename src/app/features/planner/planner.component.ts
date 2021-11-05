import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, first, map, tap } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerComponent implements OnDestroy {
  private _routeSubscription = this._route.paramMap.pipe(
    map(paramMap => paramMap.get('menuId') ?? ''),
    concatMap(routeId => {
      if (routeId) {
        return of(routeId);
      } else {
        return this._menuService.getSavedMenuId().pipe(
          tap(id => this._router.navigate(['/planner', id])),
        );
      }
    }),
    tap(id => this._menuService.selectMenu(id))
  ).subscribe();

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _menuService: MenuService,
  ) { }

  public ngOnDestroy(): void {
    this._routeSubscription.unsubscribe();
  }
}
