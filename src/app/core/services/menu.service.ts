import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { concatMap, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

import { IMenuDbo } from '@models/dbos/menu-dbo.interface';
import { IDish } from '@models/interfaces/dish.interface';
import { IMenu } from '@models/interfaces/menu.interface';
import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { Day } from '@models/types/day.type';
import { getDays } from '@utility/get-days';
import { FirestoreService } from './firestore.service';
import { LocalStorageService } from './local-storage.service';
import { DishService } from './dish.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private _endpoint = 'menus';
  private _menuId$ = new BehaviorSubject<string>('');

  constructor(
    private _firestoreService: FirestoreService,
    private _localStorageService: LocalStorageService,
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

  public getMenuEntries({ days, menu, dishes }: {
    days: Day[],
    menu: IMenu | undefined,
    dishes: IDish[],
  }): IMenuEntry[] {
    if (!menu) {
      return [];
    }
    return days.map(day => ({
      day,
      dishes: dishes.filter(dish => menu.contents[day].includes(dish.id)),
    }));
  }

  public getMenu(): Observable<IMenu | undefined> {
    return this._menuId$.pipe(
      switchMap(id => {
        if (!id) {
          return of(undefined);
        }
        return this._firestoreService.getOne<IMenuDbo>(this._endpoint, id)
      })
    );
  }

  public getMenus(): Observable<IMenu[]> {
    return this._userService.uid$.pipe(
      switchMap(uid => this._firestoreService.getMany<IMenuDbo>(this._endpoint, uid))
    );
  }

  public createMenu(name: string): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._firestoreService.createId();
          await this._firestoreService.create<IMenuDbo>(
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
        await this._updateMenu(menu.id, {
          [`contents.${day}`]: selected
            ? firebase.firestore.FieldValue.arrayUnion(dishId)
            : firebase.firestore.FieldValue.arrayRemove(dishId)
        });
      }),
      concatMap(menu => {
        if (!menu) {
          return of(undefined);
        }
        return this._firestoreService
          .getOne<IMenuDbo>(this._endpoint, menu.id)
          .pipe(first());
      }),
      concatMap(menu => {
        if (!menu) {
          return of(undefined);
        }
        return this._dishService.updateDishNew(dishId, {
          usages: firebase.firestore.FieldValue.increment(selected ? 1 : -1) as unknown as number,
          menus: Object.values(menu.contents).some(dishIds => dishIds.includes(dishId))
            ? firebase.firestore.FieldValue.arrayUnion(menu.id) as unknown as string[]
            : firebase.firestore.FieldValue.arrayRemove(menu.id) as unknown as string[]
        });
      }),
    );
  }

  // TODO: refactor to use batch updates instead of separate promises
  public clearMenuContents(day?: Day) {
    return this.getMenu().pipe(
      first(),
      tap(async menu => {
        if (!menu) {
          return;
        }
        let menuUpdates: Partial<IMenu> = {};
        let dishUpdatePromises: (Promise<void> | undefined )[] = [];

        // Clear a single day's dishes and update those dishes' `menus`
        if (day) {
          menuUpdates = {
            [`contents.${day}`]: []
          };
          const dayDishIds = menu.contents[day];
          dishUpdatePromises = dayDishIds.map(dishId => {
            const dishInOtherDay = Object
              .entries(menu.contents)
              .some(([ menuDay, menuDishIds ]) => day !== menuDay && menuDishIds.includes(dishId));

            // Always decrement `usages`, but only update `menus` if the dish isn't in any other day
            return this._dishService.updateDish(dishId, {
              usages: firebase.firestore.FieldValue.increment(-1) as unknown as number,
              ...!dishInOtherDay && {
                menus: firebase.firestore.FieldValue.arrayRemove(menu.id) as unknown as string[]
              }
            });
          });
        }
        // Clear all days' dishes and update those dishes' `menus`
        else {
          menuUpdates = {
            contents: {
              Monday: [],
              Tuesday: [],
              Wednesday: [],
              Thursday: [],
              Friday: [],
              Saturday: [],
              Sunday: [],
            }
          };
          const dishIds = Object
            .values(menu.contents)
            .reduce((allDishIds, dayDishIds) => ([...allDishIds, ...dayDishIds]), [])
            .reduce((hashMap, dishId) => ({
              ...hashMap,
              [dishId]: hashMap[dishId] ? hashMap[dishId] + 1 : 1
            }), {} as { [id: string] : number });
          dishUpdatePromises = Object
            .keys(dishIds)
            .map(dishId => {
              return this._dishService.updateDish(dishId, {
                usages: firebase.firestore.FieldValue.increment(-(dishIds[dishId])) as unknown as number,
                menus: firebase.firestore.FieldValue.arrayRemove(menu.id) as unknown as string[]
              });
            });
        }

        await Promise.all([
          this._updateMenu(menu.id, menuUpdates),
          ...dishUpdatePromises
        ]);
      }),
    );
  }

  public async deleteMenu(id?: string): Promise<void> {
    if (id) {
      await this._firestoreService.delete<IMenuDbo>(this._endpoint, id);
    }
    this._localStorageService.deleteMenuId();
    this.updateSavedMenuId().pipe(
      first()
    ).subscribe();
  }

  public getOrderedDays(): Observable<Day[]> {
    return this._userService.getPreferences().pipe(
      map(preferences => getDays(preferences?.menuStartDay)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private async _updateMenu(id: string, updates: Partial<IMenuDbo>): Promise<void> {
    return await this._firestoreService.update<IMenuDbo>(this._endpoint, id, updates);
  }

  private _setMenuId(id: string): void {
    this._localStorageService.setMenuId(id);
    this._menuId$.next(id);
  }
}
