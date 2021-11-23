import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { concatMap, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { Endpoint } from '@models/enums/endpoint.enum';
import { MenuDto } from '@models/dtos/menu-dto.interface';
import { Menu } from '@models/interfaces/menu.interface';
import { Day } from '@models/types/day.type';
import { lower } from '@shared/utility/format';
import { sort } from '@shared/utility/sort';
import { getDays } from '@utility/get-days';
import { FirestoreService } from './firestore.service';
import { LocalStorageService } from './local-storage.service';
import { BatchService } from './batch.service';
import { DishService } from './dish.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private _endpoint = Endpoint.menus;
  private _menuId$ = new BehaviorSubject<string>('');

  constructor(
    private _firestoreService: FirestoreService,
    private _localStorageService: LocalStorageService,
    private _batchService: BatchService,
    private _dishService: DishService,
    private _userService: UserService,
  ) { }

  public get menuId$(): Observable<string> {
    return this._menuId$.pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    );
  }

  public updateSavedMenuId(routeMenuId?: string): Observable<string> {
    const savedMenuId = this._localStorageService.getMenuId();
    if (routeMenuId) {
      return of(routeMenuId).pipe(
        first(),
        tap(routeMenuId => this._setMenuId(routeMenuId)),
      );
    } else if (savedMenuId) {
      return of(savedMenuId).pipe(
        first(),
        tap(savedMenuId => this._setMenuId(savedMenuId))
      );
    } else {
      return this.getMenus().pipe(
        first(),
        map(menus => menus[0]?.id ?? ''),
        tap(firstMenuId => this._setMenuId(firstMenuId))
      );
    }
  }

  public getMenu(): Observable<Menu | undefined> {
    return this._menuId$.pipe(
      switchMap(id => {
        if (!id) {
          return of(undefined);
        }
        return this._firestoreService.getOne<MenuDto>(this._endpoint, id);
      }),
      switchMap(menuDbo => {
        if (!menuDbo) {
          return of(undefined);
        }
        return this._transformMenuDbo(menuDbo);
      })
    );
  }

  public getMenus(): Observable<Menu[]> {
    return this._userService.uid$.pipe(
      switchMap(uid => this._firestoreService.getMany<MenuDto>(this._endpoint, uid)),
      switchMap(menus => combineLatest(
        menus.map(menu => this._transformMenuDbo(menu))
      )),
      map(menus => sort(menus, menu => lower(menu.name))),
    );
  }

  public createMenu(name: string): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._firestoreService.createId();
          await this._firestoreService.create<MenuDto>(
            this._endpoint,
            id,
            {
              id,
              uid,
              name,
              favorited: false,
              contents: {
                Monday: [],
                Tuesday: [],
                Wednesday: [],
                Thursday: [],
                Friday: [],
                Saturday: [],
                Sunday: [],
              },
            }
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

  public updateMenuContents({ day, dishId, selected }: {
    day: Day,
    dishId: string,
    selected: boolean,
  }): Observable<Menu | undefined> {
    return this.getMenu().pipe(
      first(),
      tap(async menu => {
        if (!menu) {
          return;
        }
        this._batchService.updateMenuContents({ menu, day, dishId, selected });
      })
    );
  }

  public async deleteMenu(id?: string): Promise<void> {
    if (id) {
      this._firestoreService.getOne<MenuDto>(this._endpoint, id).pipe(
        first(),
        tap(async menu => {
          if (!menu) {
            return;
          }
          await this._batchService.deleteMenu(menu);
        })
      ).subscribe();
    }
    this._localStorageService.deleteMenuId();
    this.updateSavedMenuId().pipe(
      first()
    ).subscribe();
  }

  public deleteMenuContents(day?: Day) {
    return this.getMenu().pipe(
      first(),
      tap(async menu => {
        if (!menu) {
          return;
        }
        await this._batchService.deleteMenuContents(menu, day);
      }),
    );
  }

  public getOrderedDays(): Observable<Day[]> {
    return this._userService.getPreferences().pipe(
      map(preferences => getDays(preferences?.menuStartDay)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private _transformMenuDbo(menu: MenuDto): Observable<Menu> {
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
          fallbackText: preferences?.emptyDishText ?? '',
        };
      }),
    );
  }

  private async _updateMenu(id: string, updates: Partial<MenuDto>): Promise<void> {
    return await this._firestoreService.update<MenuDto>(this._endpoint, id, updates);
  }

  private _setMenuId(id: string): void {
    this._localStorageService.setMenuId(id);
    this._menuId$.next(id);
  }
}
