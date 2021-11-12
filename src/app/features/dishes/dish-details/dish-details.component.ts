import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, of } from 'rxjs';
import { first, map, switchMap, tap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

import { DishService } from '@services/dish.service';
import { TagService } from '@services/tag.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

interface ITagModel {
  id: string;
  name: string;
  checked: boolean;
}

@Component({
  selector: 'app-dish-details',
  templateUrl: './dish-details.component.html',
  styleUrls: ['./dish-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishDetailsComponent {
  public id$ = this._route.paramMap.pipe(
    map(paramMap => paramMap.get('id'))
  );
  public dish$ = this._route.params.pipe(
    switchMap(({ id }) => {
      if (!id) {
        return of(undefined);
      }
      return this._dishService.getDish(id);
    })
  );
  public tagModels$ = combineLatest([
    this.dish$.pipe(
      map(dish => dish?.tags ?? [])
    ),
    this._tagService.getTags()
  ]).pipe(
    map(([dishTags, tags]) => tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      checked: dishTags.includes(tag.id)
    })))
  );
  public ingredientTrackByFn = trackByFactory<string, string>(ingredient => ingredient);
  public tagModelTrackByFn = trackByFactory<ITagModel, string>(tag => tag.id);

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _dishService: DishService,
    private _tagService: TagService,
  ) { }

  public onDelete(): void {
    this.id$.pipe(
      first(),
      tap(async id => {
        if (!id) {
          return;
        }
        await this._dishService.deleteDish(id);
      })
    ).subscribe(
      () => this._router.navigate(['..'], { relativeTo: this._route })
    );
  }

  public onTagChange(selected: boolean, tagId: string): void {
    this.id$.pipe(
      first(),
      tap(async dishId => {
        if (!dishId) {
          return;
        }
        await this._dishService.updateDish(dishId, {
          tags: selected
            ? firebase.firestore.FieldValue.arrayUnion(tagId) as unknown as string[]
            : firebase.firestore.FieldValue.arrayRemove(tagId) as unknown as string[]
        });
      })
    ).subscribe();
  }
}
