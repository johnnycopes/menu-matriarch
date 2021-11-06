import { Injectable } from "@angular/core";
import { Router, NavigationEnd, RouterEvent, NavigationCancel, NavigationError } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { map, filter, delay, tap } from "rxjs/operators";

// interface IRouterState {
//   currentRoute: string;
//   loading: boolean;
// }

@Injectable({
  providedIn: "root"
})
export class RouterService {
  private _loading$ = new BehaviorSubject<boolean>(true);

  get loading$(): Observable<boolean> {
    return this._loading$;
  }

  constructor(private _router: Router) {
    this._intialize();
  }

  private _intialize(): void {
    // this._router.events.pipe(
      // filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      // map((navigationEnd: NavigationEnd) => {
        // const routeUrl = navigationEnd.urlAfterRedirects;
        // return routeUrl;
      // })
    // ).subscribe(
      // route => this._state.set(lens => lens.to("currentRoute").value(route))
    // );

    this._router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((routerEvent: RouterEvent) => {
        if (routerEvent instanceof NavigationEnd ||
          routerEvent instanceof NavigationCancel ||
          routerEvent instanceof NavigationError) {
          return false;
        }
        return true;
      }),
    ).subscribe(
      loading => this._loading$.next(loading)
    );
  }
}
