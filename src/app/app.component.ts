import { Component, OnInit } from '@angular/core';

import { LocalStorageService } from '@services/local-storage.service';
import { MenuService } from '@services/menu.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private _localStorageService: LocalStorageService,
    private _menuService: MenuService,
  ) { }

  public ngOnInit(): void {
    const savedMenuId = this._localStorageService.getMenuId();
    if (savedMenuId) {
      this._menuService.updateMenuId(savedMenuId);
    }
  }
}
