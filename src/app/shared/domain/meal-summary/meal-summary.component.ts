import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { map } from 'rxjs/operators';

import { UserService } from '@services/user.service';

@Component({
  selector: 'app-meal-summary',
  templateUrl: './meal-summary.component.html',
  styleUrls: ['./meal-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealSummaryComponent {
  @Input() id: string | undefined;
  @Input() name: string | undefined;
  @Input() description: string | undefined;
  public fallbackName$ = this._userService.preferences$.pipe(
    map(preferences => preferences?.emptyMealText ?? '')
  );

  constructor(private _userService: UserService) { }
}
