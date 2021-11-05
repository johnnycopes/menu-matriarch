import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { concatMap, first, switchMap, tap } from 'rxjs/operators';

import { DishService } from '@services/dish.service';
import { DishType } from '@models/interfaces/dish-type.type';
import { MenuService } from '@services/menu.service';

interface IDishEditForm {
  name: string;
  description: string;
  type: DishType;
}

@Component({
  selector: 'app-dish-edit',
  templateUrl: './dish-edit.component.html',
  styleUrls: ['./dish-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishEditComponent {
  private _routeId = this._route.snapshot.paramMap.get('id');
  public dish$ = this._routeId ? this._dishService.getDish(this._routeId) : of(undefined);
  public vm$ = of(this._routeId).pipe(
    switchMap(id => {
      if (!id) {
        return of({
          name: '',
          description: '',
          type: 'main',
        });
      }
      return this.dish$;
    })
  );

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _dishService: DishService,
    private _menuService: MenuService,
  ) { }

  public async onSave(form: NgForm): Promise<void> {
    const details: IDishEditForm = {
      name: form.value.name,
      description: form.value.description,
      type: form.value.type,
    };
    if (!this._routeId) {
      this._dishService.createDish(details).pipe(
        tap(newId => this._router.navigate(['..', newId], { relativeTo: this._route }))
      ).subscribe();
    } else {
      this.dish$.pipe(
        first(),
        tap(async dish => await this._dishService.updateDish(dish?.id ?? '', details)),
        concatMap(dish => {
          if (dish?.type !== details.type) {
            console.log('do not align')
            return this._menuService.clearDishFromAllMenus(dish?.id ?? '');
          }
          return of(undefined);
        })
      ).subscribe();
    }
  }
}
