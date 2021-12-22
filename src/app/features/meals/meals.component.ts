import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-meals',
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MealsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
