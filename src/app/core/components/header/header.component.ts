import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ERoute } from '@models/enums/route.enum';
import { MenuService } from '@services/menu.service';

@Component({
  selector: 'header[app-header]',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  public ERoute: typeof ERoute = ERoute;
  public menuId$ = this._menuService.menuId$;

  constructor(private _menuService: MenuService) { }
}
