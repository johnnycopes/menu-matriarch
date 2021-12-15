import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Dish } from '@models/dish.interface';
import { FilteredDishesGroup } from '@models/filtered-dishes.interface';
import { DishType } from '@models/dish-type.type';
import { DishService } from '@services/dish.service';
import { FilterService } from '@services/filter.service';
import { RouterService } from '@services/router.service';
import { TagService } from '@services/tag.service';
import { trackByFactory } from '@utility/generic/track-by-factory';

@Component({
  selector: 'app-dishes',
  templateUrl: './dishes.component.html',
  styleUrls: ['./dishes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishesComponent {
  public vm$ = combineLatest([
    this._dishService.getDishes(),
    this._tagService.getTags(),
    this._filterService.text$,
    this._filterService.panel$,
    this._filterService.tagIds$,
    this._routerService.activeDishId$,
  ]).pipe(
    map(([dishes, tags, searchText, filterPanel, filters, activeDishId]) => {
      const activeDish = dishes.find(dish => dish.id === activeDishId);
      const filteredDishes = this._filterService.filterDishes({
        dishes, text: searchText, tagIds: filters,
      });
      return {
        tags,
        searchText,
        filters,
        filteredDishes,
        activeDish,
        filterPanel,
        initialTab: activeDish?.type ?? 'main',
        total: this._filterService.getTotalCount(filteredDishes),
      };
    })
  );
  public groupTrackByFn = trackByFactory<FilteredDishesGroup, DishType>(group => group.type);
  public dishTrackByFn = trackByFactory<Dish, string>(dish => dish.id);

  constructor(
    private _dishService: DishService,
    private _filterService: FilterService,
    private _routerService: RouterService,
    private _tagService: TagService,
  ) { }

  public onSearchTextChange(text: string): void {
    this._filterService.updateText(text);
  }

  public onFiltersButtonClick(): void {
    this._filterService.togglePanel();
  }

  public onFiltersChange(filters: string[]): void {
    this._filterService.updateTagIds(filters);
  }
}
