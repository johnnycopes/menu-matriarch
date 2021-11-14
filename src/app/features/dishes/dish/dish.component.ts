import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ITag } from '@models/interfaces/tag.interface';
import { DishType } from '@models/types/dish-type.type';

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
  @Input() tags: ITag[] = [];
  @Input() menus: string[] = [];
  @Input() usages: number = 0;
}
