import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { IMeal } from 'src/app/models/meal.interface';
import { MealService } from 'src/app/services/meal.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss']
})
export class PlannerComponent implements OnInit {
  public user$ = this._userService.user$;
  public meals$: Observable<IMeal[]> = this.user$.pipe(
    switchMap(user => {
      const userId = user?.uid;
      if (!userId) {
        return of([]);
      }
      return this._mealService.getMeals(userId);
    })
  );
  public days = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'];

  constructor(
    private _mealService: MealService,
    private _userService: AuthService,
  ) {}

  public ngOnInit(): void {
    this.user$.subscribe(console.log);
    this.meals$.subscribe(console.log);
  }
}
