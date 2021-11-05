import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { ERoute } from '@models/enums/route.enum';
import { AuthGuard } from './core/guards/auth.guard';
import { LoggedInAuthGuard } from './core/guards/logged-in-auth.guard';
import { DemoComponent } from './features/demo/demo.component';
import { DishDetailsComponent } from './features/dishes/dish-details/dish-details.component';
import { DishEditComponent } from './features/dishes/dish-edit/dish-edit.component';
import { DishPlaceholderComponent } from './features/dishes/dish-placeholder/dish-placeholder.component';
import { DishesComponent } from './features/dishes/dishes.component';
import { MenusComponent } from './features/menus/menus.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { PlannerComponent } from './features/planner/planner.component';
import { SettingsComponent } from './features/settings/settings.component';
import { ShellComponent } from './core/components/shell/shell.component';
import { WelcomeComponent } from './features/welcome/welcome.component';

const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent, canActivate: [LoggedInAuthGuard], data: { state: ERoute.welcome } },
  { path: '', component: ShellComponent, canActivate: [AuthGuard], children: [
    { path: 'demo', component: DemoComponent, data: { state: ERoute.demo } },
    { path: 'planner/:menuId', component: PlannerComponent, data: { state: ERoute.planner } },
    { path: 'menus', component: MenusComponent, data: { state: ERoute.menus } },
    { path: 'dishes', component: DishesComponent, data: { state: ERoute.dishes }, children: [
      { path: '', component: DishPlaceholderComponent, pathMatch: 'full' },
      { path: 'new', component: DishEditComponent },
      { path: ':id', component: DishDetailsComponent },
      { path: ':id/edit', component: DishEditComponent },
    ] },
    { path: '', redirectTo: 'planner', pathMatch: 'full', data: { state: ERoute.menus } },
    { path: 'settings', component: SettingsComponent, data: { state: ERoute.settings } },
  ]},
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
