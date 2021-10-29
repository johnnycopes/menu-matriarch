import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { map } from 'rxjs/operators';

import { UserService } from '@services/user.service';

@Component({
  selector: '[app-meal-name]',
  templateUrl: './meal-name.component.html',
  styleUrls: ['./meal-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealNameComponent {
  @Input('app-meal-name') name: string | undefined;
  public fallback$ = this._userService.getPreferences().pipe(
    map(preferences => preferences?.emptyMealText ?? '')
  );

  @HostBinding('class')
  public get hostClasses(): { [key: string]: boolean } {
    return {
      'app-meal-name': true,
      'app-meal-name--placeholder': !this.name,
    };
  }

  constructor(private _userService: UserService) { }
}
