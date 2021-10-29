import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { GenericModule } from '@shared/generic/generic.module';
import { InlineNameEditComponent } from './inline-name-edit/inline-name-edit.component';
import { MealNameComponent } from './meal-name/meal-name.component';
import { MealSummaryComponent } from './meal-summary/meal-summary.component';



@NgModule({
  declarations: [
    InlineNameEditComponent,
    MealNameComponent,
    MealSummaryComponent,
  ],
  exports: [
    InlineNameEditComponent,
    MealNameComponent,
    MealSummaryComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    GenericModule,
  ]
})
export class DomainModule { }
