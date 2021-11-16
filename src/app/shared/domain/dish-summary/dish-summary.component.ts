import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Tag } from '@models/interfaces/tag.interface';

@Component({
  selector: 'app-dish-summary',
  templateUrl: './dish-summary.component.html',
  styleUrls: ['./dish-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishSummaryComponent {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() description: string | undefined;
  @Input() tags: Tag[] = [];
  @Input() menus: string[] = [];
  @Input() usages: number = 0;
}
