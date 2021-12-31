import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { faLink } from '@fortawesome/free-solid-svg-icons';

import { Tag } from '@models/tag.interface';

@Component({
  selector: 'app-dish-summary',
  templateUrl: './dish-summary.component.html',
  styleUrls: ['./dish-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishSummaryComponent {
  @Input() id = '';
  @Input() name = '';
  @Input() description = '';
  @Input() link = '';
  @Input() tags: Tag[] = [];
  @Input() menus: string[] = [];
  @Input() meals: string[] = [];
  @Input() usages = 0;
  public readonly faLink = faLink;
}
