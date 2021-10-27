import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';

import { Day } from '@models/types/day.type';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  public preferences$ = this._userService.getUser().pipe(
    map(user => user?.preferences),
  );
  public days: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(private _userService: UserService) { }

  ngOnInit(): void {
  }

  public onMenuStartDayChange(day: Day): void {
    this._userService
      .updatePreferences({ menuStartDay: day })
      .subscribe();
  }

}
