import { Component, OnInit } from '@angular/core';
import { MenuService } from '@services/menu.service';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.scss']
})
export class MenusComponent implements OnInit {
  public menus$ = this._menuService.getMenus();

  constructor(private _menuService: MenuService) { }

  ngOnInit(): void {
  }

}
