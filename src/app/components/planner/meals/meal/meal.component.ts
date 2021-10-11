import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'li[app-meal]',
  templateUrl: './meal.component.html',
  styleUrls: ['./meal.component.scss']
})
export class MealComponent implements OnInit {
  @Input() name: string = '';
  @Input() description: string | undefined;

  constructor() { }

  ngOnInit(): void {
    if (!this.name) {
      throw new Error('MealComponent must have an assigned "meal" property');
    }
  }

}
