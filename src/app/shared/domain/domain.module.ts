import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { GenericModule } from '@shared/generic/generic.module';
import { DishSummaryComponent } from './dish-summary/dish-summary.component';
import { InlineNameEditComponent } from './inline-name-edit/inline-name-edit.component';
import { MealComponent } from './meal/meal.component';
import { TagComponent } from './tag/tag.component';



@NgModule({
  declarations: [
    DishSummaryComponent,
    InlineNameEditComponent,
    MealComponent,
    TagComponent,
  ],
  exports: [
    DishSummaryComponent,
    InlineNameEditComponent,
    MealComponent,
    TagComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    RouterModule,
    GenericModule,
  ]
})
export class DomainModule { }
