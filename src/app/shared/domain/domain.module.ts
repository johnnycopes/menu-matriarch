import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GenericModule } from '@shared/generic/generic.module';

import { MealComponent } from './meal/meal.component';



@NgModule({
  declarations: [
    MealComponent,
  ],
  exports: [
    MealComponent,
  ],
  imports: [
    CommonModule,
    GenericModule,
  ]
})
export class DomainModule { }
