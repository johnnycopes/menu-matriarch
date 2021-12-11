import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Dish } from '@models/interfaces/dish.interface';
import { getDishTypes } from '@models/types/get-dish-types';
import { DishService } from '@services/dish.service';
import { FilterService } from '@services/filter.service';
import { RouterService } from '@services/router.service';
import { TagService } from '@services/tag.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

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
    map(([dishes, tags, searchText, panel, filters, activeDishId]) => {
      const activeDish = dishes.find(dish => dish.id === activeDishId);
      const mains = dishes.filter(dish => this._filterService.filterDish({
        dish, type: 'main', text: searchText, tagIds: filters,
      }));
      const sides = dishes.filter(dish => this._filterService.filterDish({
        dish, type: 'side', text: searchText, tagIds: filters,
      }));
      return {
        tags,
        searchText,
        filters,
        activeDish,
        filterPanel: panel,
        initialTab: activeDish?.type ?? 'main',
        mains,
        sides,
        total: mains.length + sides.length,
      };
    })
  );
  public dishTypes = getDishTypes();
  public trackByFn = trackByFactory<Dish, string>(dish => dish.id);

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
