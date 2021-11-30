import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerComponent {
  public menu$ = this._route.paramMap.pipe(
    map(paramMap => paramMap.get('menuId')),
    switchMap(menuId => {
      if (!menuId) {
        return of(undefined);
      }
      return this._menuService.getMenu(menuId);
    })
  );

  constructor(
    private _route: ActivatedRoute,
    private _menuService: MenuService,
  ) { }
}
