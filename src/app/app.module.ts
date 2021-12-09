import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { EditorModule } from '@tinymce/tinymce-angular';
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
import { DishComponent } from './features/dishes/dish/dish.component';
import { DishDetailsComponent } from './features/dishes/dish-details/dish-details.component';
import { DishEditComponent } from './features/dishes/dish-edit/dish-edit.component';
import { DishesComponent } from './features/dishes/dishes.component';
import { DishPlaceholderComponent } from './features/dishes/dish-placeholder/dish-placeholder.component';
import { ErrorComponent } from './core/components/error/error.component';
import { HeaderComponent } from './core/components/header/header.component';
import { MenuComponent } from './features/menus/menu/menu.component';
import { MenusComponent } from './features/menus/menus.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { PlannerComponent } from './features/planner/planner.component';
import { PlannerDayComponent } from './features/planner/planner-menu/planner-day/planner-day.component';
import { PlannerDishComponent } from './features/planner/planner-dishes/planner-dish/planner-dish.component';
import { PlannerDishesComponent } from './features/planner/planner-dishes/planner-dishes.component';
import { PlannerMenuComponent } from './features/planner/planner-menu/planner-menu.component';
import { SettingsComponent } from './features/settings/settings.component';
import { ShellComponent } from './core/components/shell/shell.component';
import { TagsFormComponent } from './features/settings/tags-form/tags-form.component';
import { TagsFormItemComponent } from './features/settings/tags-form/tags-form-item/tags-form-item.component';
import { TagComponent } from './features/tags/tag/tag.component';
import { TagsComponent } from './features/tags/tags.component';
import { WelcomeComponent } from './features/welcome/welcome.component';

@NgModule({
  declarations: [
    AppComponent,
    DemoComponent,
    DemoComponentComponent,
    DishComponent,
    DishDetailsComponent,
    DishEditComponent,
    DishesComponent,
    DishPlaceholderComponent,
    ErrorComponent,
    HeaderComponent,
    MenuComponent,
    MenusComponent,
    PageNotFoundComponent,
    PlannerComponent,
    PlannerDayComponent,
    PlannerDishComponent,
    PlannerDishesComponent,
    PlannerMenuComponent,
    SettingsComponent,
    ShellComponent,
    TagComponent,
    TagsComponent,
    TagsFormComponent,
    TagsFormItemComponent,
    WelcomeComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    BrowserAnimationsModule,
    BrowserModule,
    DragDropModule,
    EditorModule,
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
