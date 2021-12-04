import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { Dish } from '@models/interfaces/dish.interface';
import { DishType } from '@models/types/dish-type.type';
import { DishService } from '@services/dish.service';
import { RouterService } from '@services/router.service';
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
    this._searchText$.asObservable().pipe(
      distinctUntilChanged(),
    ),
    this._routerService.activeDishId$,
  ]).pipe(
    map(([dishes, searchText, activeDishId]) => {
      const activeDish = dishes.find(dish => dish.id === activeDishId);
      return {
        searchText,
        total: dishes.length,
        mains: dishes.filter(dish => this._filterDish(dish, 'main', searchText)),
        sides: dishes.filter(dish => this._filterDish(dish, 'side', searchText)),
        activeDish,
        initialTab: activeDish?.type ?? 'main',
      };
    })
  );
  public trackByFn = trackByFactory<Dish, string>(dish => dish.id);

  constructor(
    private _dishService: DishService,
    private _routerService: RouterService,
  ) { }

  public onSearchTextChange(text: string): void {
    this._searchText$.next(text);
  }

  private _filterDish(dish: Dish, type: DishType, searchText: string): boolean {
    return dish.type === type &&
      (lower(dish.name).includes(lower(searchText)) ||
      lower(dish.description).includes(lower(searchText)) ||
      dish.tags.some(tag => lower(tag.name).includes(lower(searchText))));
  }
}
