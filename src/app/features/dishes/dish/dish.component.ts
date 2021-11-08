import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { DishType } from '@models/interfaces/dish-type.type';

@Component({
  selector: '[app-dish]',
  templateUrl: './dish.component.html',
  styleUrls: ['./dish.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishComponent {
  @Input() id = '';
  @Input() name = '';
  @Input() description = '';
  @Input() type: DishType = 'main';
  @Input() favorited: boolean = false;
  @Input() ingredients: string[] = [];
  @Input() menus: string[] = [];
  @Input() usages: number = 0;
}
