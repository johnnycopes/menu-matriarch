import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

import { AuthService } from '@services/auth.service';
import { MenuService } from '@services/menu.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInAuthGuard implements CanActivate {

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _menuService: MenuService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return combineLatest([
      this._authService.loggedIn$,
      this._menuService.menuId$,
    ]).pipe(
      first(),
      map(([loggedIn, menuId]) => {
        if (loggedIn) {
          return this._router.createUrlTree(['/planner', menuId]);
        }
        return true;
      })
    );
  }

}
