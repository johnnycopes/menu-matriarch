import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { FilteredDishes } from '@models/interfaces/filtered-dishes.interface';
import { Dish } from '@models/interfaces/dish.interface';
import { Menu } from '@models/interfaces/menu.interface';
import { Day } from '@models/types/day.type';
import { DishService } from '@services/dish.service';
import { FilterService } from '@services/filter.service';
import { MenuService } from '@services/menu.service';
import { TagService } from '@services/tag.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-planner-dishes',
  templateUrl: './planner-dishes.component.html',
  styleUrls: ['./planner-dishes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerDishesComponent {
  private _menu$ = new BehaviorSubject<Menu | undefined>(undefined);

  @Input()
  public set menu(value: Menu | undefined) {
    this._menu$.next(value);
  }
  public vm$ = combineLatest([
    this._menu$.asObservable(),
    this._dishService.getDishes(),
    this._tagService.getTags(),
    this._filterService.panel$,
    this._filterService.tagIds$,
    this._filterService.text$,
  ]).pipe(
    map(([menu, dishes, tags, filterPanel, filters, searchText]) => {
      const filteredDishes = this._filterService.filterDishes({
        dishes, text: searchText, tagIds: filters,
      });
      return {
        menu,
        tags,
        searchText,
        filters,
        filteredDishes,
        filterPanel,
        total: this._filterService.getTotalCount(filteredDishes),
      };
    }),
  );
  public detailsTrackByFn = trackByFactory<FilteredDishes, string>(details => details.type);
  public dishesTrackByFn = trackByFactory<Dish, string>(dish => dish.id);

  constructor(
    private _dishService: DishService,
    private _filterService: FilterService,
    private _menuService: MenuService,
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

  public async onDayChange(
    menu: Menu | undefined,
    { id, day, selected }: { id: string, day: Day, selected: boolean }
  ): Promise<void> {
    if (!menu) {
      return;
    }
    return this._menuService.updateMenuContents({
      menu,
      dishId: id,
      day,
      selected
    });
  }
}
