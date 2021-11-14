import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { IDish } from '@models/interfaces/dish.interface';
import { DishType } from '@models/types/dish-type.type';
import { DishService } from '@services/dish.service';
import { lower } from '@shared/utility/format';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-planner-dishes',
  templateUrl: './planner-dishes.component.html',
  styleUrls: ['./planner-dishes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerDishesComponent {
  private _searchText$ = new BehaviorSubject<string>('');
  public vm$ = combineLatest([
    this._dishService.getDishes(),
    this._searchText$.asObservable().pipe(
      distinctUntilChanged(),
    ),
  ]).pipe(
    map(([dishes, searchText]) => ({
      searchText,
      total: dishes.length,
      mains: dishes.filter(dish => this._filterDish(dish, 'main', searchText)),
      sides: dishes.filter(dish => this._filterDish(dish, 'side', searchText)),
    })),
  );
  public trackByFn = trackByFactory<IDish, string>(dish => dish.id);

  constructor(private _dishService: DishService) { }

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
