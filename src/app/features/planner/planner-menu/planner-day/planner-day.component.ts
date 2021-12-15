import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { Dish } from '@models/dish.interface';
import { Day } from '@models/day.type';
import { Orientation } from '@models/orientation.type';
import { trackByFactory } from '@utility/generic/track-by-factory';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-planner-day]',
  templateUrl: './planner-day.component.html',
  styleUrls: ['./planner-day.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerDayComponent implements OnInit {
  @Input() day: Day | undefined;
  @Input() dishes: Dish[] = [];
  @Input() fallbackText = '';
  @Input() orientation: Orientation = 'horizontal';
  @Output() clear = new EventEmitter<void>();
  public readonly faTimes = faTimes;
  public trackByFn = trackByFactory<Dish, string>(dish => dish.id);

  public ngOnInit(): void {
    if (!this.day) {
      throw new Error('DayComponent must have an assigned "day" property');
    }
  }
}
