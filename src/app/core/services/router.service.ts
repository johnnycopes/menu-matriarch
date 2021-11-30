import { Injectable } from "@angular/core";
import { Router, NavigationEnd, RouterEvent, NavigationCancel, NavigationError, ActivatedRouteSnapshot } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { map, filter, tap } from "rxjs/operators";

import { Route } from "@models/enums/route.enum";
import { LocalStorageService } from "./local-storage.service";

// interface IRouterState {
//   currentRoute: string;
//   loading: boolean;
// }

@Injectable({
  providedIn: "root"
})
export class RouterService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _routerEvents$ = this._router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd)
  );

  get loading$(): Observable<boolean> {
    return this._loading$;
  }

  constructor(
    private _router: Router,
    private _localStorageService: LocalStorageService,
  ) {
    this._routerEvents$.pipe(
      map((routerEvent: RouterEvent) => {
        if (routerEvent instanceof NavigationEnd ||
          routerEvent instanceof NavigationCancel ||
          routerEvent instanceof NavigationError) {
          return false;
        }
        return true;
      }),
      tap(loading => this._loading$.next(loading))
    ).subscribe();

    this._routerEvents$.pipe(
      filter(({ url }) => url.includes(Route.planner)),
      tap(event => {
        const divviedUrl = event.urlAfterRedirects.split('/');
        const menuId = divviedUrl[divviedUrl.length - 1];
        if (menuId !== Route.planner) {
          this._localStorageService.setMenuId(menuId);
        }
      })
    ).subscribe();
  }

  public getAllParams(): Record<string, string> {
    const params: Record<string, string> = {};
    let route: ActivatedRouteSnapshot | null = this._router.routerState.snapshot.root;

    do {
      for (let key in route.params) {
        params[key] = route.params[key];
      }
      route = route.firstChild;
    } while (route);

    return params;
  }

  public getParam(key: string) {
    return this.getAllParams()[key];
  }

  public getPlannerRoute(): Observable<string[]> {
    return this._localStorageService.watchMenuId().pipe(
      map(menuId => {
        if (!menuId) {
          return [Route.planner];
        }
        return [Route.planner, menuId];
      })
    );
  }
}
