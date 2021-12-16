import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

import { AuthService } from '@services/auth.service';
import { RouterService } from '@services/router.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInAuthGuard implements CanActivate {

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _routerService: RouterService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this._authService.loggedIn$.pipe(
      first(),
      switchMap(loggedIn => {
        if (loggedIn) {
          return this._routerService.getPlannerRoute().pipe(
            map(route => this._router.createUrlTree(route))
          );
        }
        return of(true);
      })
    );
  }
}
