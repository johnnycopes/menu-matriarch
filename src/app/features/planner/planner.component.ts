import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { catchError, concatMap, first, tap } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerComponent implements OnInit {
  public menu$ = this._menuService.getMenu().pipe(
    first(),
    catchError(_ => of('INVALID')),
    tap(menu => {
      if (menu === 'INVALID') {
        this._menuService.deleteMenu();
      }
    }),
  );

  constructor(
    private _route: ActivatedRoute,
    private _menuService: MenuService,
  ) { }

  public ngOnInit(): void {
    this._route.paramMap.pipe(
      first(),
      concatMap(paramMap => {
        const menuId = paramMap.get('menuId') ?? undefined;
        return this._menuService.updateSavedMenuId(menuId);
      }),
    ).subscribe();
  }
}
