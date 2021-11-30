import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerComponent { }
