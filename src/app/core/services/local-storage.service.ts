import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private _prefix = 'MENU_MATRIARCH_';

  constructor() { }

  public getMenuId(): string | null {
    return window.localStorage.getItem(this._prefix + 'MENU_ID');
  }

  public setMenuId(id: string): void {
    window.localStorage.setItem(this._prefix + 'MENU_ID', id);
  }
}
