import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';

import { DishType } from '@models/interfaces/dish-type.type';
import { IDish } from '@models/interfaces/dish.interface';
import { UserService } from '@services/user.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-dish-summary',
  templateUrl: './dish-summary.component.html',
  styleUrls: ['./dish-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishSummaryComponent implements OnInit {
  @Input() id: string | undefined;
  @Input() name: string | undefined;
  @Input() description: string | undefined;
  @Input() type: DishType | undefined;
  @Input() sides: IDish[] | undefined;
  public trackByFn = trackByFactory<IDish, string>(dish => dish.id);
  public fallbackName$ = this._userService.getPreferences().pipe(
    map(preferences => preferences?.emptyDishText ?? '')
  );

  @HostBinding('class')
  public get hostClass(): string {
    return this.description || this.type ? 'vertical' : 'horizontal'
  }

  constructor(private _userService: UserService) { }

  public ngOnInit(): void {
    if ((this.description || this.type) && this.sides) {
      throw new Error('app-dish-summary should either be passed a `description` and `type` OR `sides`');
    }
  }
}
