import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-meal-summary',
  templateUrl: './meal-summary.component.html',
  styleUrls: ['./meal-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealSummaryComponent implements OnInit {
  @Input() name: string = '';
  @Input() description: string | undefined;

  constructor() { }

  ngOnInit(): void {
    if (!this.name) {
      throw new Error('MealComponent must have an assigned "meal" property');
    }
  }
}
