import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { GenericModule } from '@shared/generic/generic.module';
import { DishSummaryComponent } from './dish-summary/dish-summary.component';
import { InlineNameEditComponent } from './inline-name-edit/inline-name-edit.component';
import { MealComponent } from './meal/meal.component';



@NgModule({
  declarations: [
    DishSummaryComponent,
    InlineNameEditComponent,
    MealComponent,
  ],
  exports: [
    DishSummaryComponent,
    InlineNameEditComponent,
    MealComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    GenericModule,
  ]
})
export class DomainModule { }
