import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { ERoute } from '@models/enums/route.enum';
import { DemoComponent } from './features/demo/demo.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { PlannerComponent } from './features/planner/planner.component';
import { ShellComponent } from './core/components/shell/shell.component';
import { WelcomeComponent } from './features/welcome/welcome.component';
import { MealEditComponent } from './features/planner/meal-edit/meal-edit.component';

const routes: Routes = [
  { path: '', component: ShellComponent, children: [
    { path: 'welcome', component: WelcomeComponent, data: { state: ERoute.welcome } },
    { path: 'demo', component: DemoComponent, data: { state: ERoute.demo } },
    { path: 'planner', component: PlannerComponent, data: { state: ERoute.planner } },
    { path: 'planner/meal', component: MealEditComponent, data: { state: ERoute.planner } },
    { path: 'planner/meal/:mealId', component: MealEditComponent, data: { state: ERoute.planner } },
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
