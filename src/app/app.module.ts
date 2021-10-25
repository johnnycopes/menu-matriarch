import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from "@angular/forms";
import { NgModule } from '@angular/core';
import { OverlayModule } from "@angular/cdk/overlay";
import { PortalModule } from "@angular/cdk/portal";

import { environment } from '@env/environment';

import { AppRoutingModule } from './app-routing.module';
import { DomainModule } from '@shared/domain/domain.module';
import { GenericModule } from '@shared/generic/generic.module';

import { AppComponent } from './app.component';
import { DemoComponent } from './features/demo/demo.component';
import { DemoComponentComponent } from './features/demo/demo-component/demo-component.component';
import { HeaderComponent } from './core/components/header/header.component';
import { MealComponent } from './features/meals/meal/meal.component';
import { MealDetailsComponent } from './features/meals/meal-details/meal-details.component';
import { MealEditComponent } from './features/meals/meal-edit/meal-edit.component';
import { MealPlaceholderComponent } from './features/meals/meal-placeholder/meal-placeholder.component';
import { MealsComponent } from './features/meals/meals.component';
import { MenuComponent } from './features/menus/menu/menu.component';
import { MenusComponent } from './features/menus/menus.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { PlannerComponent } from './features/planner/planner.component';
import { PlannerDayComponent } from './features/planner/planner-menu/planner-day/planner-day.component';
import { PlannerMealComponent } from './features/planner/planner-meals/planner-meal/planner-meal.component';
import { PlannerMealsComponent } from './features/planner/planner-meals/planner-meals.component';
import { PlannerMenuComponent } from './features/planner/planner-menu/planner-menu.component';
import { PrintComponent } from './features/print/print.component';
import { ShellComponent } from './core/components/shell/shell.component';
import { WelcomeComponent } from './features/welcome/welcome.component';

@NgModule({
  declarations: [
    AppComponent,
    DemoComponent,
    DemoComponentComponent,
    HeaderComponent,
    MealComponent,
    MealDetailsComponent,
    MealEditComponent,
    MealPlaceholderComponent,
    MealsComponent,
    MenuComponent,
    MenusComponent,
    PageNotFoundComponent,
    PlannerComponent,
    PlannerDayComponent,
    PlannerMealComponent,
    PlannerMealsComponent,
    PlannerMenuComponent,
    PrintComponent,
    ShellComponent,
    WelcomeComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    BrowserAnimationsModule,
    BrowserModule,
    DragDropModule,
    FontAwesomeModule,
    FormsModule,
		OverlayModule,
    PortalModule,
    AppRoutingModule,
    DomainModule,
    GenericModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
