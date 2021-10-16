import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { MenuService } from '@services/menu.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.scss']
})
export class MenusComponent implements OnInit {
  public menus$ = combineLatest([
    this._menuService.getMenus(),
    this._userService.getUser(),
  ]).pipe(
    map(([menus, user]) => menus.map(
      menu => ({ ...menu, selected: user?.selectedMenuId === menu.id })
    ))
  );

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
