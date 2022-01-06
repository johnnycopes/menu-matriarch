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
import { DishService } from './dish.service';
import { DocumentService } from './document.service';
import { FirestoreService } from './firestore.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MenuDocumentService {
  private _endpoint = Endpoint.menus;

  constructor(
    private _dishService: DishService,
    private _documentService: DocumentService,
    private _firestoreService: FirestoreService,
    private _userService: UserService,
  ) { }

  public getMenu(id: string): Observable<Menu | undefined> {
    return combineLatest([
      this._firestoreService.getOne<MenuDto>(this._endpoint, id),
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
        switchMap(uid => this._firestoreService.getMany<MenuDto>(this._endpoint, uid)),
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
    const id = this._firestoreService.createId();
    await this._firestoreService.create<MenuDto>(
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
    return await this._firestoreService.update<MenuDto>(this._endpoint, id, updates);
  }

  public async updateMenuContents({
    menu, dishIds, day, selected
  }: {
    menu: Menu,
    dishIds: string[],
    day: Day,
    selected: boolean,
  }): Promise<void> {
    const batch = this._firestoreService.getBatch();
    this._documentService.processUpdates(batch, [
      ...this._documentService.getDishCountersUpdates({
        change: selected ? 'increment' : 'decrement',
        dishIds,
        menu,
      }),
      ...this._documentService.getMenuContentsUpdates({
        change: selected ? 'increment' : 'decrement',
        menuIds: [menu.id],
        dishIds,
        day,
      }),
    ]);
    await batch.commit();
  }

  public async deleteMenu(menu: Menu): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._documentService.getMenuDoc(menu.id));
    this._documentService.processUpdates(batch,
      this._documentService.getDishCountersUpdates({
        change: 'clear',
        dishIds: flattenValues(menu.contents),
        menu,
      }),
    );
    await batch.commit();
  }

  public async deleteMenuContents(menu: Menu, day?: Day): Promise<void> {
    const batch = this._firestoreService.getBatch();
    // Clear a single day's contents
    if (day) {
      this._documentService.processUpdates(batch, [
        ...this._documentService.getMenuContentsUpdates({
          change: 'clear',
          menuIds: [menu.id],
          day,
        }),
        ...this._documentService.getDishCountersUpdates({
          change: 'decrement',
          dishIds: menu.contents[day],
          menu,
        }),
      ]);
    }
    // Clear all days' contents
    else {
      this._documentService.processUpdates(batch, [
        ...this._documentService.getMenuContentsUpdates({
          change: 'clear',
          menuIds: [menu.id],
        }),
        ...this._documentService.getDishCountersUpdates({
          change: 'clear',
          dishIds: flattenValues(menu.contents),
          menu,
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
