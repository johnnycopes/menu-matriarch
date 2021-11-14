import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { IDish } from '@models/interfaces/dish.interface';
import { DishType } from '@models/types/dish-type.type';
import { DishService } from '@services/dish.service';
import { lower } from '@shared/utility/format';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-dishes',
  templateUrl: './dishes.component.html',
  styleUrls: ['./dishes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishesComponent {
  private _searchText$ = new BehaviorSubject<string>('');
  public vm$ = combineLatest([
    this._dishService.getDishes(),
    of(this._route.snapshot.firstChild?.params.id),
    this._searchText$.asObservable().pipe(
      distinctUntilChanged(),
    ),
  ]).pipe(
    map(([dishes, routeId, searchText]) => {
      return {
        searchText,
        total: dishes.length,
        mains: dishes.filter(dish => this._filterDish(dish, 'main', searchText)),
        sides: dishes.filter(dish => this._filterDish(dish, 'side', searchText)),
        initialTab: dishes
          .find(dish => dish.id === routeId)
          ?.type ?? 'main',
      };
    })
  );
  public trackByFn = trackByFactory<IDish, string>(dish => dish.id);

  constructor(
    private _route: ActivatedRoute,
    private _dishService: DishService,
  ) { }

  public onSearchTextChange(text: string): void {
    this._searchText$.next(text);
  }

  private _filterDish(dish: IDish, type: DishType, searchText: string): boolean {
    return dish.type === type &&
      (lower(dish.name).includes(lower(searchText)) ||
      lower(dish.description).includes(lower(searchText)) ||
      dish.tags.some(tag => lower(tag.name).includes(lower(searchText))));
  }
}
