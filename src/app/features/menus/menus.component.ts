import { Component, OnInit } from '@angular/core';

import { MenuService } from '@services/menu.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.scss']
})
export class MenusComponent implements OnInit {
  public menus$ = this._menuService.getMenus();

  constructor(
    private _menuService: MenuService,
    private _userService: UserService,
  ) { }

  ngOnInit(): void {
  }

  public selectMenu(menuId: string): void {
    this._userService.updateUser({
      selectedMenuId: menuId
    });
  }

}
