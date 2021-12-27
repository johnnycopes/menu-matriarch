import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { PlannerView } from '@models/planner-view.type';
import { MenuService } from '@services/menu.service';
import { RouterService } from '@services/router.service';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerComponent {
  public view$ = this._routerService.activePlannerView$.pipe(tap(console.log));
  public menu$ = this._route.paramMap.pipe(
    map(paramMap => paramMap.get('menuId') ?? 'NO_ID'),
    switchMap(menuId => this._menuService.getMenu(menuId)),
    catchError(_ => of<'INVALID'>('INVALID')),
  );

  constructor(
    private _route: ActivatedRoute,
    private _menuService: MenuService,
    private _routerService: RouterService,
  ) { }

  public updatePlannerView(view: PlannerView): void {
    this._routerService.updatePlannerView(view);
  }
}
