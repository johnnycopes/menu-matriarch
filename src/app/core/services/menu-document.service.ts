import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Day } from '@models/day.type';
import { Dish } from '@models/dish.interface';
import { DishDto } from '@models/dtos/dish-dto.interface';
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
import { DocRefUpdate, DocumentService } from './document.service';
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
      ...this._getUpdatedDishDocs({
        dishIds,
        menu,
        change: selected ? 'increment' : 'decrement'
      }),
      ...this._documentService.getUpdatedMenuDocs({
        menuIds: [menu.id],
        day,
        getDishes: selected
          ? () => this._firestoreService.addToArray(...dishIds)
          : () => this._firestoreService.removeFromArray(...dishIds)
      }),
    ]);
    await batch.commit();
  }

  public async deleteMenu(menu: Menu): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._documentService.getMenuDoc(menu.id));
    this._documentService.processUpdates(batch,
      this._getUpdatedDishDocs({
        dishIds: flattenValues(menu.contents),
        menu,
        change: 'clear'
      }),
    );
    await batch.commit();
  }

  public async deleteMenuContents(menu: Menu, day?: Day): Promise<void> {
    const batch = this._firestoreService.getBatch();
    // Clear a single day's contents
    if (day) {
      this._documentService.processUpdates(batch, [
        ...this._documentService.getUpdatedMenuDocs({ menuIds: [menu.id], day }),
        ...this._getUpdatedDishDocs({
          dishIds: menu.contents[day],
          menu,
          change: 'decrement'
        }),
      ]);
    }
    // Clear all days' contents
    else {
      this._documentService.processUpdates(batch, [
        ...this._documentService.getUpdatedMenuDocs({ menuIds: [menu.id] }),
        ...this._getUpdatedDishDocs({
          dishIds: flattenValues(menu.contents),
          menu,
          change: 'clear'
        }),
      ]);
    }
    await batch.commit();
  }

  private _getUpdatedDishDocs({ dishIds, menu, change }: {
    dishIds: string[],
    menu: Menu,
    change: 'increment' | 'decrement' | 'clear',
  }): DocRefUpdate<DishDto, { usages: number, menus?: string[] }>[] {
    const dishCounts = flattenValues(menu.contents)
      .reduce((hashMap, dishId) => ({
        ...hashMap,
        [dishId]: hashMap[dishId] ? hashMap[dishId] + 1 : 1
      }), {} as { [dishId: string]: number });

    return dishIds.map(dishId => {
      const dishCount = dishCounts[dishId] ?? 0;
      let menusChange = 0;
      if (dishCount === 0 && change === 'increment') {
        menusChange = 1;
      } else if ((dishCount === 1 && change === 'decrement') || change === 'clear') {
        menusChange = -1;
      }
      const menus = menusChange > 0
        ? this._firestoreService.addToArray(menu.id)
        : this._firestoreService.removeFromArray(menu.id);
      return {
        docRef: this._documentService.getDishDoc(dishId),
        updates: {
          usages: this._firestoreService.changeCounter(change === 'increment' ? 1 : -1),
          ...(menusChange !== 0 && { menus }), // only include `menus` if `menusChange` isn't 0
        },
      };
    });
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
