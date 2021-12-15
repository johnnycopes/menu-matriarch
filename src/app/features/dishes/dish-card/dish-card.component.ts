import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Tag } from '@models/tag.interface';
import { DishType } from '@models/dish-type.type';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-dish-card]',
  templateUrl: './dish-card.component.html',
  styleUrls: ['./dish-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishCardComponent {
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
