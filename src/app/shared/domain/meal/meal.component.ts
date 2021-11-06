import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { map } from 'rxjs/operators';

import { IDish } from '@models/interfaces/dish.interface';
import { UserService } from '@services/user.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-meal',
  templateUrl: './meal.component.html',
  styleUrls: ['./meal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealComponent {
  @Input() dishes: IDish[] = [];
  public trackByFn = trackByFactory<IDish, string>(dish => dish.id);
  public fallbackName$ = this._userService.getPreferences().pipe(
    map(preferences => preferences?.emptyDishText ?? '')
  );

  constructor(private _userService: UserService) { }
}
