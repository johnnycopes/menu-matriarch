import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { faMap } from '@fortawesome/free-regular-svg-icons';

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
  @Input() menus: string[] = [];
  public faMap = faMap;
}
