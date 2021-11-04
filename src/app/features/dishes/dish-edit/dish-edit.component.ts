import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { first, map, switchMap, tap } from 'rxjs/operators';

import { DishService } from '@services/dish.service';
import { IDish } from '@models/interfaces/dish.interface';

@Component({
  selector: 'app-dish-edit',
  templateUrl: './dish-edit.component.html',
  styleUrls: ['./dish-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishEditComponent {
  public id$ = this._route.paramMap.pipe(
    map(paramMap => paramMap.get('id'))
  );
  public vm$ = this._route.params.pipe(
    switchMap(({ id }) => {
      if (!id) {
        return of({
          name: '',
          description: '',
          ingredients: [],
        });
      }
      return this._dishService.getDish(id);
    })
  );

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _dishService: DishService,
  ) { }

  public onSave(form: NgForm): void {
    this.id$.pipe(
      first(),
      tap(async id => {
        if (!id) {
          this._dishService.createDish({
            name: form.value.name,
            description: form.value.description,
            type: 'main',
          }).subscribe();
        } else {
          await this._dishService.updateDish(id, {
            name: form.value.name,
            description: form.value.description,
          });
        }
      })
    ).subscribe(
      () => this._router.navigate(['..'], { relativeTo: this._route })
    );
  }
}
