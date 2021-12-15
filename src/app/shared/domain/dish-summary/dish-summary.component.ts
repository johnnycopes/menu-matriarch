import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { faLink } from '@fortawesome/free-solid-svg-icons';

import { Tag } from '@models/tag.interface';
import { trackByFactory } from '@utility/generic/track-by-factory';

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
  @Input() usages = 0;
  public readonly faLink = faLink;
  public trackByFn = trackByFactory<Tag, string>(tag => tag.id);
}
