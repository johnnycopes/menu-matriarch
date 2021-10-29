import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { IMeal } from '@models/interfaces/meal.interface';

import { Day } from '@models/types/day.type';

@Component({
  selector: '[app-planner-day]',
  templateUrl: './planner-day.component.html',
  styleUrls: ['./planner-day.component.scss']
})
export class PlannerDayComponent implements OnInit {
  @Input() day: Day | undefined;
  @Input() meal: IMeal | undefined;
  @Input() emptyMealText = '';
  @Output() clear = new EventEmitter<void>();
  public faTimes: IconDefinition = faTimes;

  constructor() { }

  ngOnInit(): void {
    if (!this.day) {
      throw new Error('DayComponent must have an assigned "day" property');
    }
  }

}
