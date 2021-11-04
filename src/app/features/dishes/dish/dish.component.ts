import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

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
  @Input() favorited: boolean = false;
  @Input() ingredients: string[] = [];
}
