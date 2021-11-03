import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '@services/auth.service';
import { MealService } from '@services/meal.service';
import { MenuService } from '@services/menu.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent {
  public user$ = this._userService.getUser();

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _mealService: MealService,
    private _menuService: MenuService,
    private _userService: UserService,
  ) { }

  public async login(): Promise<void> {
    try {
      const user = await this._authService.login();
      if (user) {
        const { name, email } = user;
        forkJoin([
          this._userService.createUser({ name, email }),
          this._menuService.createMenu('My First Menu'),
          this._mealService.createMeal({ name: 'Bagels', description: 'Delicious round vessels from Poland' }),
          this._mealService.createMeal({ name: 'DIY', description: "You're on your own tonight!" }),
          this._mealService.createMeal({ name: 'Pizza', description: 'Delicious flat vessel from Italy' }),
          this._mealService.createMeal({ name: 'Salad', description: 'Lots of leaves in a bowl. Gross!' }),
          this._mealService.createMeal({ name: 'Sushi', description: 'Delicious tiny vessels from Japan' }),
          this._mealService.createMeal({ name: 'Tacos', description: 'Delicious small vessels from Mexico' }),
        ]).subscribe(() => this._router.navigate(['/planner']));
      } else {
        this._router.navigate(['/planner']);
      }
    } catch (e) {
      console.error(e);
    }
  }
}
