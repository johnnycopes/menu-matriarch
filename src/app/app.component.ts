import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ErrorService } from '@services/error.service';
import { MenuService } from '@services/menu.service';
import { RouterService } from '@services/router.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  public error$ = this._errorService.errors$;
  public loading$ = this._routerService.loading$;

  constructor(
    private _errorService: ErrorService,
    private _menuService: MenuService,
    private _routerService: RouterService,
  ) { }

  public ngOnInit(): void {
    this._menuService.updateSavedMenuId().pipe(
      first(),
    ).subscribe();
  }
}
