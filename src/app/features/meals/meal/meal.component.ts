import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: '[app-meal]',
  templateUrl: './meal.component.html',
  styleUrls: ['./meal.component.scss']
})
export class MealComponent implements OnInit {
  @Input() id = '';
  @Input() name = '';
  @Input() description = '';
  @Input() favorited: boolean = false;
  @Input() ingredients: string[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
