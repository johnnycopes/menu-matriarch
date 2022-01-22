import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Tag } from '@models/tag.interface';
import { DishType } from '@models/dish-type.type';

@Component({
  selector: 'app-dish-card',
  templateUrl: './dish-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishCardComponent {
  @Input() id = '';
  @Input() name = '';
  @Input() description = '';
  @Input() link = '';
  @Input() type: DishType = 'main';
  @Input() favorited = false;
  @Input() ingredients: string[] = [];
  @Input() tags: Tag[] = [];
  @Input() menus: string[] = [];
  @Input() meals: string[] = [];
  @Input() usages = 0;
  @Input() active = false;
}
