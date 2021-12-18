import { Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { concatMap, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { Endpoint } from '@models/endpoint.enum';
import { createMenuDto } from '@shared/utility/domain/create-dtos';
import { MenuDto } from '@models/dtos/menu-dto.interface';
import { Menu } from '@models/menu.interface';
import { Day } from '@models/day.type';
import { getDays } from '@utility/domain/get-days';
import { lower } from '@utility/generic/format';
import { sort } from '@utility/generic/sort';
import { FirestoreService } from './firestore.service';
import { BatchService } from './batch.service';
import { DishService } from './dish.service';
import { LocalStorageService } from './local-storage.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private _endpoint = Endpoint.menus;

  constructor(
    private _firestoreService: FirestoreService,
    private _localStorageService: LocalStorageService,
    private _batchService: BatchService,
    private _dishService: DishService,
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

  public createMenu(menu: Partial<Omit<MenuDto, 'id' | 'uid'>>): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._firestoreService.createId();
          await this._firestoreService.create<MenuDto>(
            this._endpoint,
            id,
            createMenuDto({ id, uid, ...menu }),
          );
          return id;
        } else {
          return undefined;
        }
      })
    );
  }

  public updateMenuName(id: string, name: string): Promise<void> {
    return this._updateMenu(id, { name });
  }

  public updateMenuStartDay(id: string, startDay: Day): Promise<void> {
    return this._updateMenu(id, { startDay });
  }

  public updateMenuContents({ menu, day, dishId, selected }: {
    menu: Menu,
    day: Day,
    dishId: string,
    selected: boolean,
  }): Promise<void> {
    return this._batchService.updateMenuContents({ menu, day, dishId, selected });
  }

  public async deleteMenu(id?: string): Promise<void> {
    if (id) {
      this.getMenu(id).pipe(
        first(),
        tap(async menu => {
          if (!menu) {
            return;
          }
          await this._batchService.deleteMenu(menu);
          if (id === this._localStorageService.getMenuId()) {
            this._localStorageService.deleteMenuId();
          }
        })
      ).subscribe();
    }
  }

  public deleteMenuContents(menu: Menu, day?: Day): Promise<void> {
    return this._batchService.deleteMenuContents(menu, day);
  }

  public getOrderedDays(): Observable<readonly Day[]> {
    return this._userService.getPreferences().pipe(
      map(preferences => getDays(preferences?.menuStartDay)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private _transformMenuDto(menu: MenuDto): Observable<Menu> {
    return combineLatest([
      this.getOrderedDays(),
      this._dishService.getDishes(),
      this._userService.getPreferences(),
    ]).pipe(
      map(([days, dishes, preferences]) => {
        return {
          ...menu,
          entries: days.map(day => ({
            day,
            dishes: dishes.filter(dish => menu.contents[day].includes(dish.id)),
          })),
          orientation: preferences?.menuOrientation ?? 'horizontal',
          fallbackText: preferences?.emptyMealText ?? '',
        };
      }),
    );
  }

  private async _updateMenu(id: string, updates: Partial<MenuDto>): Promise<void> {
    return await this._firestoreService.update<MenuDto>(this._endpoint, id, updates);
  }
}
