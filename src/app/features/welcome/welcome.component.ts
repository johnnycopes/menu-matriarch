import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '@services/auth.service';
import { DishService } from '@services/dish.service';
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
    private _dishService: DishService,
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
          this._dishService.createDish({ name: 'Bagels', description: 'Delicious round vessels from Poland', type: 'main' }),
          this._dishService.createDish({ name: 'DIY', description: "You're on your own tonight!", type: 'main' }),
          this._dishService.createDish({ name: 'Pizza', description: 'Delicious flat vessel from Italy', type: 'main' }),
          this._dishService.createDish({ name: 'Salad', description: 'Lots of leaves in a bowl. Gross!', type: 'main' }),
          this._dishService.createDish({ name: 'Sushi', description: 'Delicious tiny vessels from Japan', type: 'main'}),
          this._dishService.createDish({ name: 'Tacos', description: 'Delicious small vessels from Mexico', type: 'main' }),
        ]).subscribe(() => this._router.navigate(['/planner']));
      } else {
        this._router.navigate(['/planner']);
      }
    } catch (e) {
      console.error(e);
    }
  }
}
