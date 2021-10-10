import { Component, Input, OnInit } from '@angular/core';

import { Day } from 'src/app/models/types/day.type';

@Component({
  selector: 'li[app-day]',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.scss']
})
export class DayComponent implements OnInit {
  @Input() day: Day | undefined;
  @Input() meal: string | undefined;

  constructor() { }

  ngOnInit(): void {
    if (!this.day) {
      throw new Error("DayComponent must have an assigned 'day' property");
    }
  }

}
