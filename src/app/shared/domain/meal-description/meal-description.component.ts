import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-meal-description',
  templateUrl: './meal-description.component.html',
  styleUrls: ['./meal-description.component.scss']
})
export class MealDescriptionComponent implements OnInit {
  @Input() name: string = '';
  @Input() description: string | undefined;

  constructor() { }

  ngOnInit(): void {
    if (!this.name) {
      throw new Error('MealComponent must have an assigned "meal" property');
    }
  }

}
