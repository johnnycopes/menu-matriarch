import { Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Day } from '@models/day.type';
import { Endpoint } from '@models/endpoint.enum';
import { Menu } from '@models/menu.interface';
import { MenuDto } from '@models/dtos/menu-dto.interface';
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
    return this._firestoreService.getOne<MenuDto>(this._endpoint, id).pipe(
      switchMap(menuDto => {
        if (!menuDto) {
          return of(undefined);
        }
        return this._transformMenuDto(menuDto);
      })
    );
  }

  public getMenus(): Observable<Menu[]> {
    return this._userService.uid$.pipe(
      switchMap(uid => this._firestoreService.getMany<MenuDto>(this._endpoint, uid)),
      switchMap(menus => combineLatest(
        menus.map(menu => this._transformMenuDto(menu))
      )),
      map(menus => sort(menus, menu => lower(menu.name))),
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
      ...this._documentService.getUpdatedDishDocsCounters({
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
      this._documentService.getUpdatedDishDocsCounters({
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
        ...this._documentService.getUpdatedDishDocsCounters({
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
        ...this._documentService.getUpdatedDishDocsCounters({
          dishIds: flattenValues(menu.contents),
          menu,
          change: 'clear'
        }),
      ]);
    }
    await batch.commit();
  }

  // TODO: investigate refactoring this to a more pure "_getMenu" method OR the tag/dish services' equivalent of this to "_transform____" for consistency
  private _transformMenuDto(menu: MenuDto): Observable<Menu> {
    return combineLatest([
      this._dishService.getDishes(),
      this._userService.getPreferences(),
    ]).pipe(
      map(([dishes, preferences]) => {
        return {
          ...menu,
          entries: getDays(menu.startDay)
            .map(day => ({
              day,
              dishes: dishes.filter(dish => menu.contents[day].includes(dish.id)),
            })
          ),
          orientation: preferences?.mealOrientation ?? 'horizontal',
          fallbackText: preferences?.emptyMealText ?? '',
        };
      }),
    );
  }
}
