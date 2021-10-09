import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'li[app-day]',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.scss']
})
export class DayComponent implements OnInit {
  @Input() day: string | undefined;
  @Input() name = '';

  constructor() { }

  ngOnInit(): void {
    if (!this.day) {
      throw new Error("DayComponent must have an assigned 'day' property");
    }
  }

}
