import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';

import { IUserPreferences } from '@models/interfaces/user.interface';
import { Day } from '@models/types/day.type';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';
import { getDays } from '@utility/get-days';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  public user$ = this._userService.getUser();
  public preferences$ = this._userService.preferences$;
  public updateAction$ = new Subject<Partial<IUserPreferences>>();
  public days: Day[] = getDays();
  private _destroy$ = new Subject<void>();

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _userService: UserService,
  ) { }

  public ngOnInit(): void {
    this.updateAction$.pipe(
      takeUntil(this._destroy$),
      debounceTime(200),
      switchMap(update => this._userService.updatePreferences(update))
    ).subscribe();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public async signOut(): Promise<void> {
    try {
      await this._authService.logout();
      this._router.navigate(['/welcome']);
    } catch (e) {
      console.error(e);
    }
  }
}
