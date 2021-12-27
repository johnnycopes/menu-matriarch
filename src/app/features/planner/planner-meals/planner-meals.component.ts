import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { Menu } from '@models/menu.interface';

@Component({
  selector: 'app-planner-meals',
  templateUrl: './planner-meals.component.html',
  styleUrls: ['./planner-meals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlannerMealsComponent {
  @Input() menu: Menu | undefined;
}
