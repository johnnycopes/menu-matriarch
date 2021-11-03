import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: '[app-meal]',
  templateUrl: './meal.component.html',
  styleUrls: ['./meal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealComponent {
  @Input() id = '';
  @Input() name = '';
  @Input() description = '';
  @Input() favorited: boolean = false;
  @Input() ingredients: string[] = [];
}
