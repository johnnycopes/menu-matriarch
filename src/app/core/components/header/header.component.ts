import { Component, ChangeDetectionStrategy } from '@angular/core';

import { environment } from '@env/environment';
import { Route } from '@models/enums/route.enum';
import { MenuService } from '@services/menu.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'header[app-header]',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  public ERoute: typeof Route = Route;
  public menuId$ = this._menuService.menuId$;
  public showDemo = !environment.production;

  constructor(private _menuService: MenuService) { }
}
