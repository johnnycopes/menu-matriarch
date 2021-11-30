import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Tag } from '@models/interfaces/tag.interface';
import { DishType } from '@models/types/dish-type.type';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-dish]',
  templateUrl: './dish.component.html',
  styleUrls: ['./dish.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishComponent {
  @Input() id = '';
  @Input() name = '';
  @Input() description = '';
  @Input() link = '';
  @Input() type: DishType = 'main';
  @Input() favorited: boolean = false;
  @Input() ingredients: string[] = [];
  @Input() tags: Tag[] = [];
  @Input() menus: string[] = [];
  @Input() usages: number = 0;
  @Input() active = false;
}
