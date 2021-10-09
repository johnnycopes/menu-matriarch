import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { IMeal } from './models/meal.interface';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="user$ | async as user; else showLogin">
      <h1>Hello {{ user.displayName }}!</h1>
      <button (click)="logout()">Logout</button>
    </div>
    <ng-template #showLogin>
      <p>Please login.</p>
      <button (click)="login()">Login with Google</button>
    </ng-template>
  `,
})
export class AppComponent implements OnInit {
  public user$ = this._userService.user$;
  public meals$: Observable<IMeal[]> = this.user$.pipe(
    switchMap(user => {
      const userId = user?.uid;
      if (!userId) {
        return of([]);
      }
      return this._userService.getMeals(userId);
    })
  );

  constructor(private _userService: UserService) {}

  public ngOnInit(): void {
    this.user$.subscribe(console.log);
    this.meals$.subscribe(console.log);
  }

  public login(): void {
    this._userService.login();
  }

  public logout(): void {
    this._userService.logout();
  }
}
