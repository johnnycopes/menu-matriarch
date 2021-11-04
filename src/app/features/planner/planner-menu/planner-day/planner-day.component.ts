import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { IDish } from '@models/interfaces/dish.interface';
import { Day } from '@models/types/day.type';

@Component({
  selector: '[app-planner-day]',
  templateUrl: './planner-day.component.html',
  styleUrls: ['./planner-day.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerDayComponent implements OnInit {
  @Input() day: Day | undefined;
  @Input() main: IDish | undefined;
  @Input() sides: IDish[] = [];
  @Input() emptyDishText = '';
  @Output() clear = new EventEmitter<void>();
  public readonly faTimes = faTimes;

  public ngOnInit(): void {
    if (!this.day) {
      throw new Error('DayComponent must have an assigned "day" property');
    }
  }
}
