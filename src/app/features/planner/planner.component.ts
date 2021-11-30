import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerComponent {
  public menu$ = this._route.paramMap.pipe(
    map(paramMap => paramMap.get('menuId') ?? 'NO_ID'),
    switchMap(menuId => this._menuService.getMenu(menuId)),
    catchError(_ => of<'INVALID'>('INVALID')),
    tap(console.log),
  );

  constructor(
    private _route: ActivatedRoute,
    private _menuService: MenuService,
  ) { }
}
