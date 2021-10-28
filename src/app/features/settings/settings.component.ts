import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { Day } from '@models/types/day.type';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';
import { getDays } from '@utility/get-days';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  public user$ = this._userService.getUser();
  public preferences$ = this._userService.getUser().pipe(
    map(user => user?.preferences),
  );
  public days: Day[] = getDays();

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _userService: UserService,
  ) { }

  ngOnInit(): void {
  }

  public onMenuStartDayChange(day: Day): void {
    this._userService
      .updatePreferences({ menuStartDay: day })
      .subscribe();
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
