import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { ERoute } from '@models/enums/route.enum';
import { DemoComponent } from './features/demo/demo.component';
import { MealEditComponent } from './features/meals/meal-edit/meal-edit.component';
import { MealsComponent } from './features/meals/meals.component';
import { MenusComponent } from './features/menus/menus.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { PlannerComponent } from './features/planner/planner.component';
import { ShellComponent } from './core/components/shell/shell.component';
import { WelcomeComponent } from './features/welcome/welcome.component';

const routes: Routes = [
  { path: '', component: ShellComponent, children: [
    { path: 'welcome', component: WelcomeComponent, data: { state: ERoute.welcome } },
    { path: 'demo', component: DemoComponent, data: { state: ERoute.demo } },
    { path: 'planner/:menuId', component: PlannerComponent, data: { state: ERoute.planner } },
    { path: 'menus', component: MenusComponent, data: { state: ERoute.menus } },
    { path: 'meals/:mealId', component: MealEditComponent, data: { state: ERoute.meals } },
    { path: 'meals', component: MealsComponent, data: { state: ERoute.meals } },
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
