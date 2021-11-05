import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatMap, first } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerComponent implements OnInit {

  constructor(
    private _route: ActivatedRoute,
    private _menuService: MenuService,
  ) { }

  public ngOnInit(): void {
    this._route.paramMap.pipe(
      first(),
      concatMap(paramMap => {
        const menuId = paramMap.get('menuId') ?? undefined;
        if (menuId) {
          return this._menuService.updateSavedMenuId(menuId);
        } else {
          return of(undefined);
        }
      }),
    ).subscribe();
  }
}
