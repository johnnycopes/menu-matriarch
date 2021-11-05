import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, concatMap, first, tap } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';
import { IMenu } from '@models/interfaces/menu.interface';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerComponent implements OnInit {
  public menu$: Observable<IMenu | undefined> = of(undefined);

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
    this.menu$ = this._menuService.getMenu().pipe(
      catchError(_ => of(undefined)),
      tap(menu => {
        if (!menu) {
          this._menuService.deleteMenu();
        }
      })
    );
  }
}
