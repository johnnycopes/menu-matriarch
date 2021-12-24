import { Component, ChangeDetectionStrategy, ContentChild, TemplateRef } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DishService } from '@services/dish.service';
import { FilterService } from '@services/filter.service';
import { RouterService } from '@services/router.service';
import { TagService } from '@services/tag.service';
import { trackByDishType, trackById } from '@utility/domain/track-by-functions';

@Component({
  selector: 'app-dishes-list',
  templateUrl: './dishes-list.component.html',
  styleUrls: ['./dishes-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DishesListComponent {
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
  public readonly groupTrackByFn = trackByDishType;
  public readonly dishTrackByFn = trackById;

  @ContentChild('dishTemplate')
  public dishTemplate: TemplateRef<any> | null = null;

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
