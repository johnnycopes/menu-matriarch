import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { concatMap, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

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
      switchMap(uid => this._firestoreService.getOne<IMenu>(this._endpoint, uid))
    );
  }

  public getMenus(): Observable<IMenu[]> {
    return this._userService.uid$.pipe(
      switchMap(uid => this._firestoreService.getMany<IMenu>(this._endpoint, uid))
    );
  }

  public createMenu(name: string): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._firestoreService.createId();
          await this._firestoreService.create<IMenu>(
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

  public async deleteMenu(id?: string): Promise<void> {
    if (id) {
      await this._firestoreService.delete<IMenu>(this._endpoint, id);
    }
    this._localStorageService.deleteMenuId();
    this.updateSavedMenuId().pipe(
      first()
    ).subscribe();
  }

  public updateMenuName(id: string, name: string): Promise<void> {
    return this._updateMenu(id, { name });
  }

  // TODO: update dish's menus array whenever a change is made to a menu
  public updateMenuContents({ day, dishId, selected }: {
    day: Day,
    dishId: string,
    selected: boolean,
  }): Observable<string | undefined> {
    return this.menuId$.pipe(
      first(),
      tap(async menuId => {
        if (!menuId) {
          return;
        }
        await Promise.all([
          this._updateMenu(menuId, {
            [`contents.${day}`]: selected
              ? firebase.firestore.FieldValue.arrayUnion(dishId)
              : firebase.firestore.FieldValue.arrayRemove(dishId)
          }),
          // this._dishService.updateDish(dishId, {
          //   menus: selected
          //     ? firebase.firestore.FieldValue.arrayUnion(menuId) as unknown as string[]
          //     : firebase.firestore.FieldValue.arrayRemove(menuId) as unknown as string[]
          // })
        ]);
      }),
    );
  }

  // TODO: update dish's/dishes' menus array(s) whenever a change/changes is/are made to a menu
  public clearMenuContents(day?: Day): Observable<string | undefined> {
    return this.menuId$.pipe(
      first(),
      tap(async menuId => {
        if (!menuId) {
          return;
        }
        let updates: Partial<IMenu> = {};
        if (day) {
          updates = {
            [`contents.${day}`]: []
          };
        } else {
          updates = {
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
        }
        await this._updateMenu(menuId, updates);
      }),
    );
  }

  public getOrderedDays(): Observable<Day[]> {
    return this._userService.getPreferences().pipe(
      map(preferences => getDays(preferences?.menuStartDay)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private async _updateMenu(id: string, updates: Partial<IMenu>): Promise<void> {
    return await this._firestoreService.update<IMenu>(this._endpoint, id, updates);
  }

  private _setMenuId(id: string): void {
    this._localStorageService.setMenuId(id);
    this._menuId$.next(id);
  }
}
