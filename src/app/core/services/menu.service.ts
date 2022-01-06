import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { concatMap, first, tap } from 'rxjs/operators';

import { MenuDto } from '@models/dtos/menu-dto.interface';
import { Menu } from '@models/menu.interface';
import { Day } from '@models/day.type';
import { AuthService } from './auth.service';
import { LocalStorageService } from './local-storage.service';
import { MenuDocumentService } from './menu-document.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(
    private _authService: AuthService,
    private _localStorageService: LocalStorageService,
    private _menuDocumentService: MenuDocumentService,
    private _userService: UserService,
  ) { }

  public getMenu(id: string): Observable<Menu | undefined> {
    return this._menuDocumentService.getMenu(id);
  }

  public getMenus(): Observable<Menu[]> {
    return this._authService.uid$.pipe(
      first(),
      concatMap(uid => {
        if (uid) {
          return this._menuDocumentService.getMenus(uid);
        }
        return of([]);
      })
    );
  }

  public createMenu(menu: Partial<Omit<MenuDto, 'id' | 'uid' | 'startDay'>>): Observable<string | undefined> {
    return this._userService.getUser().pipe(
      first(),
      concatMap(async user => {
        if (user) {
          const id = await this._menuDocumentService.createMenu({
            uid: user.uid,
            menu,
            startDay: user.preferences.defaultMenuStartDay,
          });
          return id;
        } else {
          return undefined;
        }
      })
    );
  }

  public updateMenuName(id: string, name: string): Promise<void> {
    return this._menuDocumentService.updateMenu(id, { name });
  }

  public updateMenuStartDay(id: string, startDay: Day): Promise<void> {
    return this._menuDocumentService.updateMenu(id, { startDay });
  }

  public updateMenuContents({ menu, day, dishIds, selected }: {
    menu: Menu,
    day: Day,
    dishIds: string[],
    selected: boolean,
  }): Promise<void> {
    return this._menuDocumentService.updateMenuContents({ menu, day, dishIds, selected });
  }

  public async deleteMenu(id?: string): Promise<void> {
    if (id) {
      this.getMenu(id).pipe(
        first(),
        tap(async menu => {
          if (!menu) {
            return;
          }
          await this._menuDocumentService.deleteMenu(menu);
          if (id === this._localStorageService.getMenuId()) {
            this._localStorageService.deleteMenuId();
          }
        })
      ).subscribe();
    }
  }

  public deleteMenuContents(menu: Menu, day?: Day): Promise<void> {
    return this._menuDocumentService.deleteMenuContents(menu, day);
  }
}
