import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { Dish } from '@models/interfaces/dish.interface';
import { Menu } from '@models/interfaces/menu.interface';
import { Tag } from '@models/interfaces/tag.interface';
import { Day } from '@models/types/day.type';
import { DishType } from '@models/types/dish-type.type';
import { DishService } from '@services/dish.service';
import { MenuService } from '@services/menu.service';
import { TagService } from '@services/tag.service';
import { lower } from '@shared/utility/format';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-planner-dishes',
  templateUrl: './planner-dishes.component.html',
  styleUrls: ['./planner-dishes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerDishesComponent {
  private _menu$ = new BehaviorSubject<Menu | undefined>(undefined);
  private _filterPanel$ = new BehaviorSubject<boolean>(false);
  private _searchText$ = new BehaviorSubject<string>('');

  @Input()
  public set menu(value: Menu | undefined) {
    this._menu$.next(value);
  }
  public vm$ = combineLatest([
    this._menu$.asObservable(),
    this._dishService.getDishes(),
    this._filterPanel$.asObservable(),
    this._searchText$.asObservable().pipe(
      distinctUntilChanged(),
    ),
    this._tagService.getTags(),
  ]).pipe(
    map(([menu, dishes, filterPanel, searchText, tags]) => ({
      menu,
      searchText,
      filterPanel,
      total: dishes.length,
      mains: dishes.filter(dish => this._filterDish(dish, 'main', searchText)),
      sides: dishes.filter(dish => this._filterDish(dish, 'side', searchText)),
      tags,
    })),
  );
  public dishTrackByFn = trackByFactory<Dish, string>(dish => dish.id);
  public tagTrackByFn = trackByFactory<Tag, string>(tag => tag.id);

  constructor(
    private _dishService: DishService,
    private _menuService: MenuService,
    private _tagService: TagService,
  ) { }

  public onSearchTextChange(text: string): void {
    this._searchText$.next(text);
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

  public toggleFilterPanel(state: boolean): void {
    this._filterPanel$.next(!state);
  }

  private _filterDish(dish: Dish, type: DishType, searchText: string): boolean {
    return dish.type === type &&
      (lower(dish.name).includes(lower(searchText)) ||
      lower(dish.description).includes(lower(searchText)) ||
      dish.tags.some(tag => lower(tag.name).includes(lower(searchText))));
  }
}
