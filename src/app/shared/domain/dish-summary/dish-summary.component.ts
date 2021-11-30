import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { faLink } from '@fortawesome/free-solid-svg-icons';

import { Tag } from '@models/interfaces/tag.interface';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-dish-summary',
  templateUrl: './dish-summary.component.html',
  styleUrls: ['./dish-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishSummaryComponent {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() description: string = '';
  @Input() link: string = '';
  @Input() tags: Tag[] = [];
  @Input() menus: string[] = [];
  @Input() usages: number = 0;
  public readonly faLink = faLink;
  public trackByFn = trackByFactory<Tag, string>(tag => tag.id);
}
