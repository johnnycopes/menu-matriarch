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
import { SharedModule } from '@shared/shared.module';

import { AppComponent } from './app.component';
import { DayComponent } from './features/planner/day/day.component';
import { DemoComponent } from './features/demo/demo.component';
import { DemoComponentComponent } from './features/demo/demo-component/demo-component.component';
import { HeaderComponent } from './core/components/header/header.component';
import { MealComponent } from './features/planner/meal/meal.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { PlannerComponent } from './features/planner/planner.component';
import { WelcomeComponent } from './features/welcome/welcome.component';
import { ShellComponent } from './core/components/shell/shell.component';

@NgModule({
  declarations: [
    AppComponent,
    DayComponent,
    DemoComponent,
    DemoComponentComponent,
    HeaderComponent,
    MealComponent,
    PageNotFoundComponent,
    PlannerComponent,
    WelcomeComponent,
    ShellComponent,
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
    SharedModule,
    FontAwesomeModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
