import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { GenericModule } from '@shared/generic/generic.module';
import { InlineNameEditComponent } from './inline-name-edit/inline-name-edit.component';
import { DishSummaryComponent } from './dish-summary/dish-summary.component';



@NgModule({
  declarations: [
    InlineNameEditComponent,
    DishSummaryComponent,
  ],
  exports: [
    InlineNameEditComponent,
    DishSummaryComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    GenericModule,
  ]
})
export class DomainModule { }
