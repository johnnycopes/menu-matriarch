import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { first, tap } from 'rxjs/operators';

import { AuthService } from '@services/auth.service';
import { DishService } from '@services/dish.service';
import { MenuService } from '@services/menu.service';
import { TagService } from '@services/tag.service';
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
    private _tagService: TagService,
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
          this._tagService.createTag('Vegetarian'),
          this._tagService.createTag('Vegan'),
          this._dishService.createDish({ name: 'Bagels', description: 'Delicious round vessels from Poland', type: 'main', tags: [] }),
          this._dishService.createDish({ name: 'Mashed Potatoes', description: "Delicious squishy vessel from the U.K.", type: 'side', tags: [] }),
          this._dishService.createDish({ name: 'Pizza', description: 'Delicious flat vessel from Italy', type: 'main', tags: [] }),
          this._dishService.createDish({ name: 'Salad', description: 'Lots of leaves in a bowl. Gross!', type: 'side', tags: [] }),
          this._dishService.createDish({ name: 'Sushi', description: 'Delicious tiny vessels from Japan', type: 'main', tags: []}),
          this._dishService.createDish({ name: 'Tacos', description: 'Delicious small vessels from Mexico', type: 'main', tags: [] }),
        ]).pipe(
          tap(([_, menuId]) => this._router.navigate(['/planner', menuId]))
        ).subscribe();
      } else {
        this._menuService.menuId$.pipe(
          first(),
          tap(menuId => this._router.navigate(['/planner', menuId]))
        ).subscribe();
      }
    } catch (e) {
      console.error(e);
    }
  }
}
