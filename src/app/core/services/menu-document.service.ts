import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Day } from '@models/day.type';
import { Dish } from '@models/dish.interface';
import { Endpoint } from '@models/endpoint.enum';
import { Menu } from '@models/menu.interface';
import { MenuDto } from '@models/dtos/menu-dto.interface';
import { UserPreferences } from '@models/user-preferences.interface';
import { createMenuDto } from '@utility/domain/create-dtos';
import { getDays } from '@utility/domain/get-days';
import { flattenValues } from '@utility/generic/flatten-values';
import { lower } from '@utility/generic/format';
import { sort } from '@utility/generic/sort';
import { ApiService } from './api.service';
import { DishService } from './dish.service';
import { DocumentService } from './document.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MenuDocumentService {
  private _endpoint = Endpoint.menus;

  constructor(
    private _apiService: ApiService,
    private _dishService: DishService,
    private _documentService: DocumentService,
    private _userService: UserService,
  ) { }

  public getMenu(id: string): Observable<Menu | undefined> {
    return combineLatest([
      this._apiService.getOne<MenuDto>(this._endpoint, id),
      this._dishService.getDishes(),
      this._userService.getPreferences(),
    ]).pipe(
      map(([menuDto, dishes, preferences]) => {
        if (!menuDto || !preferences) {
          return undefined;
        }
        return this._transformDto({ menuDto, dishes, preferences });
      })
    );
  }

  public getMenus(): Observable<Menu[]> {
    return combineLatest([
      this._userService.uid$.pipe(
        switchMap(uid => this._apiService.getMany<MenuDto>(this._endpoint, uid)),
        map(menuDtos => sort(menuDtos, menuDto => lower(menuDto.name))),
      ),
      this._dishService.getDishes(),
      this._userService.getPreferences(),
    ]).pipe(
      map(([menuDtos, dishes, preferences]) => {
        if (!menuDtos || !preferences) {
          return [];
        }
        return menuDtos.map(menuDto => this._transformDto({ menuDto, dishes, preferences }));
      }),
    );
  }

  public async createMenu({ uid, menu, startDay }: {
    uid: string,
    menu: Partial<Omit<MenuDto, 'id' | 'uid' | 'startDay'>>,
    startDay: Day,
  }) {
    const id = this._apiService.createId();
    await this._apiService.create<MenuDto>(
      this._endpoint,
      id,
      createMenuDto({
        ...menu,
        id,
        uid,
        startDay,
      }),
    );
    return id;
  }

  public async updateMenu(id: string, updates: Partial<MenuDto>): Promise<void> {
    return await this._apiService.update<MenuDto>(this._endpoint, id, updates);
  }

  public async updateMenuContents({
    menu, dishIds, day, selected
  }: {
    menu: Menu,
    dishIds: string[],
    day: Day,
    selected: boolean,
  }): Promise<void> {
    const batch = this._apiService.createBatch();
    this._documentService.processUpdates(batch, [
      ...this._documentService.getDishCountersUpdates({
        dishIds,
        menu,
        change: selected ? 'increment' : 'decrement',
      }),
      ...this._documentService.getMenuContentsUpdates({
        menuIds: [menu.id],
        dishIds,
        day,
        change: selected ? 'add' : 'remove',
      }),
    ]);
    await batch.commit();
  }

  public async deleteMenu(menu: Menu): Promise<void> {
    const batch = this._apiService.createBatch();
    batch.delete(this._documentService.getMenuDoc(menu.id));
    this._documentService.processUpdates(batch,
      this._documentService.getDishCountersUpdates({
        dishIds: flattenValues(menu.contents),
        menu,
        change: 'clear',
      }),
    );
    await batch.commit();
  }

  public async deleteMenuContents(menu: Menu, day?: Day): Promise<void> {
    const batch = this._apiService.createBatch();
    // Clear a single day's contents
    if (day) {
      this._documentService.processUpdates(batch, [
        ...this._documentService.getMenuContentsUpdates({
          menuIds: [menu.id],
          dishIds: [],
          day,
        }),
        ...this._documentService.getDishCountersUpdates({
          dishIds: menu.contents[day],
          menu,
          change: 'decrement',
        }),
      ]);
    }
    // Clear all days' contents
    else {
      this._documentService.processUpdates(batch, [
        ...this._documentService.getMenuContentsUpdates({
          menuIds: [menu.id],
          dishIds: [],
        }),
        ...this._documentService.getDishCountersUpdates({
          dishIds: flattenValues(menu.contents),
          menu,
          change: 'clear',
        }),
      ]);
    }
    await batch.commit();
  }

  private _transformDto({ menuDto, dishes, preferences }: {
    menuDto: MenuDto,
    dishes: Dish[],
    preferences: UserPreferences,
  }): Menu {
    return {
      ...menuDto,
      entries: getDays(menuDto.startDay)
        .map(day => ({
          day,
          dishes: dishes.filter(dish => menuDto.contents[day].includes(dish.id)),
        })
      ),
      orientation: preferences?.mealOrientation ?? 'horizontal',
      fallbackText: preferences?.emptyMealText ?? '',
    };
  }
}
