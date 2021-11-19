import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { concatMap, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

import { Endpoint } from '@models/enums/endpoint.enum';
import { MenuDbo } from '@models/dbos/menu-dbo.interface';
import { Menu } from '@models/interfaces/menu.interface';
import { Day } from '@models/types/day.type';
import { lower } from '@shared/utility/format';
import { sort } from '@shared/utility/sort';
import { getDays } from '@utility/get-days';
import { FirestoreService } from './firestore.service';
import { LocalStorageService } from './local-storage.service';
import { DocRefService } from './doc-ref.service';
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
    private _docRefService: DocRefService,
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
        return this._firestoreService.getOne<MenuDbo>(this._endpoint, id);
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
      switchMap(uid => this._firestoreService.getMany<MenuDbo>(this._endpoint, uid)),
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
          await this._firestoreService.create<MenuDbo>(
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
  }) {
    return this.getMenu().pipe(
      first(),
      tap(async menu => {
        if (!menu) {
          return;
        }
        const batch = this._firestoreService.getBatch();
        const dishIdCount = Object
          .values(menu.contents)
          .reduce((allDishIds, dayDishIds) => ([...allDishIds, ...dayDishIds]), [])
          .reduce((accum, curr) => accum + (curr === dishId ? 1 : 0), 0);
        let menusChange = 0;
        if (dishIdCount === 0 && selected) {
          menusChange = 1;
        } else if (dishIdCount === 1 && !selected) {
          menusChange = -1;
        }
        this._updateOneDayMenuContents({
          batch,
          dishId,
          menuId: menu.id,
          daysChange: selected ? 1 : -1,
          menusChange: menusChange,
        });
        batch.update(this._docRefService.getMenu(menu.id), {
          [`contents.${day}`]: selected
            ? this._firestoreService.addToArray(dishId)
            : this._firestoreService.removeFromArray(dishId)
        });
        await batch.commit();
      })
    );
  }

  public async deleteMenu(id?: string): Promise<void> {
    if (id) {
      this._firestoreService.getOne<MenuDbo>(this._endpoint, id).pipe(
        first(),
        tap(async menu => {
          if (!menu) {
            return;
          }
          const batch = this._firestoreService.getBatch();
          batch.delete(this._docRefService.getMenu(id));
          this._deleteAllDaysMenuContents(batch, menu);
          await batch.commit();
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
        const batch = this._firestoreService.getBatch();

        // Clear a single day's contents
        if (day) {
          batch.update(this._docRefService.getMenu(menu.id), {
            [`contents.${day}`]: []
          });
          menu.contents[day].forEach(dishId => {
            const dishInOtherDay = Object
              .entries(menu.contents)
              .some(([ menuDay, menuDishIds ]) => day !== menuDay && menuDishIds.includes(dishId));
            // Always decrement `usages`, but only update `menus` if the dish isn't in any other day
            this._updateOneDayMenuContents({
              batch,
              dishId,
              menuId: menu.id,
              daysChange: -1,
              menusChange: dishInOtherDay ? 0 : -1,
            });
          });
        }
        // Clear all days' contents
        else {
          batch.update(this._docRefService.getMenu(menu.id), {
            contents: {
              Monday: [],
              Tuesday: [],
              Wednesday: [],
              Thursday: [],
              Friday: [],
              Saturday: [],
              Sunday: [],
            }
          });
          this._deleteAllDaysMenuContents(batch, menu);
        }

        await batch.commit();
      }),
    );
  }

  public getOrderedDays(): Observable<Day[]> {
    return this._userService.getPreferences().pipe(
      map(preferences => getDays(preferences?.menuStartDay)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private _transformMenuDbo(menu: MenuDbo): Observable<Menu> {
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

  private async _updateMenu(id: string, updates: Partial<MenuDbo>): Promise<void> {
    return await this._firestoreService.update<MenuDbo>(this._endpoint, id, updates);
  }

  private _updateOneDayMenuContents({ batch, dishId, menuId, daysChange, menusChange }: {
    batch: firebase.firestore.WriteBatch,
    dishId: string,
    menuId: string,
    daysChange: number,
    menusChange: number,
  }): void {
    batch.update(this._docRefService.getDish(dishId), {
      usages: this._firestoreService.changeCounter(daysChange),
    });
    if (menusChange !== 0) {
      batch.update(this._docRefService.getDish(dishId), {
        menus: menusChange > 0
          ? this._firestoreService.addToArray(menuId)
          : this._firestoreService.removeFromArray(menuId)
      });
    }
  }

  private _deleteAllDaysMenuContents<T extends MenuDbo>(
    batch: firebase.firestore.WriteBatch,
    menu: T,
  ): void {
    const dishIdHashMap = Object
      .values(menu.contents)
      .reduce((allDishIds, dayDishIds) => ([...allDishIds, ...dayDishIds]), [])
      .reduce((hashMap, dishId) => ({
        ...hashMap,
        [dishId]: hashMap[dishId] ? hashMap[dishId] + 1 : 1
      }), {} as { [id: string]: number });
    Object
      .keys(dishIdHashMap)
      .forEach(dishId => {
        this._updateOneDayMenuContents({
          batch,
          dishId,
          menuId: menu.id,
          daysChange: -(dishIdHashMap[dishId]),
          menusChange: -1,
        })
      });
  }

  private _setMenuId(id: string): void {
    this._localStorageService.setMenuId(id);
    this._menuId$.next(id);
  }
}
