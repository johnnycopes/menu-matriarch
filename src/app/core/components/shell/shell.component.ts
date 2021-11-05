import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { first } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';
import { routerTransition } from './router-transition';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [routerTransition],
})
export class ShellComponent implements OnInit {

  constructor(private _menuService: MenuService) { }

  public ngOnInit(): void {
    this._menuService.updateSavedMenuId().pipe(
      first(),
    ).subscribe();
  }

  public getState(outlet: RouterOutlet): string | undefined {
    return outlet?.activatedRouteData?.state;
  }
}
