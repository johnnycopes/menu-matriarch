import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GenericModule } from '@shared/generic/generic.module';
import { MealDescriptionComponent } from './meal-description/meal-description.component';



@NgModule({
  declarations: [
    MealDescriptionComponent,
  ],
  exports: [
    MealDescriptionComponent,
  ],
  imports: [
    CommonModule,
    GenericModule,
  ]
})
export class DomainModule { }
