import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

import { environment } from 'src/environments/environment';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { DayComponent } from './components/planner/days/day/day.component';
import { DaysComponent } from './components/planner/days/days.component';
import { MealComponent } from './components/planner/meals/meal/meal.component';
import { MealsComponent } from './components/planner/meals/meals.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { PlannerComponent } from './components/planner/planner.component';
import { WelcomeComponent } from './components/welcome/welcome.component';

@NgModule({
  declarations: [
    AppComponent,
    DayComponent,
    DaysComponent,
    MealComponent,
    MealsComponent,
    PageNotFoundComponent,
    PlannerComponent,
    WelcomeComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
