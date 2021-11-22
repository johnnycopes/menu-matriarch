import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, of } from 'rxjs';
import { concatMap, first, map, tap } from 'rxjs/operators';

import { DishType } from '@models/types/dish-type.type';
import { DishService } from '@services/dish.service';
import { TagService } from '@services/tag.service';

interface IDishEditForm {
  name: string;
  description: string;
  type: DishType;
  tags: string[];
}


@Component({
  selector: 'app-dish-edit',
  templateUrl: './dish-edit.component.html',
  styleUrls: ['./dish-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishEditComponent {
  private _routeId = this._route.snapshot.paramMap.get('id');
  public dish$ = this._routeId
    ? this._dishService.getDish(this._routeId)
    : of(undefined);
  public vm$ = combineLatest([
    this.dish$,
    this._tagService.getTags(),
  ]).pipe(
    map(([dish, tags]) => {
      if (!dish) {
        return {
          name: '',
          description: '',
          type: 'main',
          tags: tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            checked: false,
          })),
        };
      } else {
        return {
          ...dish,
          tags: tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            checked: !!dish?.tags.find(dishTag => dishTag.id === tag.id)
          })),
        };
      }
    })
  );

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _dishService: DishService,
    private _tagService: TagService,
  ) { }

  public async onSave(form: NgForm): Promise<void> {
    const details: IDishEditForm = {
      name: form.value.name,
      description: form.value.description,
      type: form.value.type,
      tags: Object
        .entries<boolean>(form.value.tags)
        .filter(([key, checked]) => checked)
        .map(([key, checked]) => key)
    };
    if (!this._routeId) {
      this._dishService.createDish(details).pipe(
        tap(newId => this._router.navigate(['..', newId], { relativeTo: this._route }))
      ).subscribe();
    } else {
      this.dish$.pipe(
        first(),
        concatMap(dish => {
          if (dish) {
            return this._dishService.updateDish(dish.id, details);
          } else {
            return of(undefined);
          }
        }),
        tap(() => this._router.navigate(['..'], { relativeTo: this._route }))
      ).subscribe();
    }
  }
}
