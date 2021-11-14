import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { IDish } from '@models/interfaces/dish.interface';
import { Day } from '@models/types/day.type';
import { Orientation } from '@models/types/orientation.type';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: '[app-planner-day]',
  templateUrl: './planner-day.component.html',
  styleUrls: ['./planner-day.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerDayComponent implements OnInit {
  @Input() day: Day | undefined;
  @Input() dishes: IDish[] = [];
  @Input() emptyDishText = '';
  @Input() orientation: Orientation = 'horizontal';
  @Output() clear = new EventEmitter<void>();
  public readonly faTimes = faTimes;
  public trackByFn = trackByFactory<IDish, string>(dish => dish.id);

  public ngOnInit(): void {
    if (!this.day) {
      throw new Error('DayComponent must have an assigned "day" property');
    }
  }
}
