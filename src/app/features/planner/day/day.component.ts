import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { IMeal } from '@models/interfaces/meal.interface';

import { Day } from '@models/types/day.type';

@Component({
  selector: 'li[app-day]',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.scss']
})
export class DayComponent implements OnInit {
  @Input() day: Day | undefined;
  @Input() meal: IMeal | undefined;
  @Output() clear = new EventEmitter<void>();
  public faTimes: IconDefinition = faTimes;

  constructor() { }

  ngOnInit(): void {
    if (!this.day) {
      throw new Error('DayComponent must have an assigned "day" property');
    }
  }

}
