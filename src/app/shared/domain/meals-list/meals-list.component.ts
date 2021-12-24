import { Component, ChangeDetectionStrategy, ContentChild, TemplateRef } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { FilterService } from '@services/filter.service';
import { MealService } from '@services/meal.service';
import { RouterService } from '@services/router.service';
import { TagService } from '@services/tag.service';
import { trackById } from '@utility/domain/track-by-functions';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-meals-list',
  templateUrl: './meals-list.component.html',
  styleUrls: ['./meals-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MealsListComponent {
  public vm$ = combineLatest([
    this._mealService.getMeals(),
    this._tagService.getTags(),
    this._userService.getPreferences(),
    this._filterService.text$,
    this._filterService.panel$,
    this._filterService.tagIds$,
  ]).pipe(
    map(([meals, tags, preferences, searchText, filterPanel, filters]) => {
      return {
        meals,
        tags,
        preferences,
        searchText,
        filters,
        filterPanel,
      };
    })
  );
  public readonly trackByFn = trackById;

  @ContentChild('mealTemplate')
  public mealTemplate: TemplateRef<any> | null = null;

  constructor(
    private _filterService: FilterService,
    private _mealService: MealService,
    private _routerService: RouterService,
    private _tagService: TagService,
    private _userService: UserService,
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
