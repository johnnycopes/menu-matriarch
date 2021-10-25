import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { ERoute } from '@models/enums/route.enum';
import { DemoComponent } from './features/demo/demo.component';
import { MealDetailsComponent } from './features/meals/meal-details/meal-details.component';
import { MealEditComponent } from './features/meals/meal-edit/meal-edit.component';
import { MealPlaceholderComponent } from './features/meals/meal-placeholder/meal-placeholder.component';
import { MealsComponent } from './features/meals/meals.component';
import { MenusComponent } from './features/menus/menus.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { PlannerComponent } from './features/planner/planner.component';
import { PrintComponent } from './features/print/print.component';
import { ShellComponent } from './core/components/shell/shell.component';
import { WelcomeComponent } from './features/welcome/welcome.component';

const routes: Routes = [
  { path: 'print/:menuId', component: PrintComponent, data: { state: ERoute.print } },
  { path: '', component: ShellComponent, children: [
    { path: 'welcome', component: WelcomeComponent, data: { state: ERoute.welcome } },
    { path: 'demo', component: DemoComponent, data: { state: ERoute.demo } },
    { path: 'planner/:menuId', component: PlannerComponent, data: { state: ERoute.planner } },
    { path: 'menus', component: MenusComponent, data: { state: ERoute.menus } },
    { path: 'meals', component: MealsComponent, data: { state: ERoute.meals }, children: [
      { path: '', component: MealPlaceholderComponent, pathMatch: 'full' },
      { path: 'new', component: MealEditComponent },
      { path: ':id', component: MealDetailsComponent },
      { path: ':id/edit', component: MealEditComponent },
    ] },
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
