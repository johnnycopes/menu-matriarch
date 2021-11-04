import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { map } from 'rxjs/operators';

import { UserService } from '@services/user.service';

@Component({
  selector: 'app-dish-summary',
  templateUrl: './dish-summary.component.html',
  styleUrls: ['./dish-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishSummaryComponent {
  @Input() id: string | undefined;
  @Input() name: string | undefined;
  @Input() description: string | undefined;
  public fallbackName$ = this._userService.getPreferences().pipe(
    map(preferences => preferences?.emptyDishText ?? '')
  );

  constructor(private _userService: UserService) { }
}
