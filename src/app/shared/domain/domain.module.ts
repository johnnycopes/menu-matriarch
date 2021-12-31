import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { GenericModule } from '@shared/generic/generic.module';

import { CountComponent } from './count/count.component';
import { DishesListComponent } from './dishes-list/dishes-list.component';
import { DishSummaryComponent } from './dish-summary/dish-summary.component';
import { EmptyViewPlaceholderComponent } from './empty-view-placeholder/empty-view-placeholder.component';
import { FilterableListComponent } from './filterable-list/filterable-list.component';
import { FiltersButtonComponent } from './filters-button/filters-button.component';
import { FiltersComponent } from './filters/filters.component';
import { InlineDaySelectComponent } from './inline-day-select/inline-day-select.component';
import { InlineNameEditComponent } from './inline-name-edit/inline-name-edit.component';
import { MealsListComponent } from './meals-list/meals-list.component';
import { MealSummaryComponent } from './meal-summary/meal-summary.component';
import { TagComponent } from './tag/tag.component';
import { TagsComponent } from './tags/tags.component';



@NgModule({
  declarations: [
    CountComponent,
    DishesListComponent,
    DishSummaryComponent,
    EmptyViewPlaceholderComponent,
    FilterableListComponent,
    FiltersButtonComponent,
    FiltersComponent,
    InlineDaySelectComponent,
    InlineNameEditComponent,
    MealsListComponent,
    MealSummaryComponent,
    TagComponent,
    TagsComponent,
  ],
  exports: [
    CountComponent,
    DishesListComponent,
    DishSummaryComponent,
    EmptyViewPlaceholderComponent,
    FilterableListComponent,
    FiltersButtonComponent,
    FiltersComponent,
    InlineDaySelectComponent,
    InlineNameEditComponent,
    MealsListComponent,
    MealSummaryComponent,
    TagComponent,
    TagsComponent,
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
