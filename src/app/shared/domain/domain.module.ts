import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GenericModule } from '@shared/generic/generic.module';
import { MealSummaryComponent } from './meal-summary/meal-summary.component';



@NgModule({
  declarations: [
    MealSummaryComponent,
  ],
  exports: [
    MealSummaryComponent,
  ],
  imports: [
    CommonModule,
    GenericModule,
  ]
})
export class DomainModule { }
