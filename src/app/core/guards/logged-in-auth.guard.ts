import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

import { AuthService } from '@services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInAuthGuard implements CanActivate {

  constructor(
    private _router: Router,
    private _authService: AuthService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // return this._authService.loggedIn$.pipe(
    //   first(),
    //   tap(loggedIn => {
    //     if (loggedIn) {
    //       this._router.navigate(['/menus']);
    //     }
    //   }),
    //   map(loggedIn => {
    //     return !loggedIn;
    //   })
    // );
    console.log(route, state);
    // return true;
    return this._authService.loggedIn$.pipe(
      first(),
      map(loggedIn => {
        if (loggedIn) {
          this._router.createUrlTree(['/menus']);
          return false;
        }
        return true;
      })
    );
  }

}
