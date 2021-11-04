import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

import { IDish } from '@models/interfaces/dish.interface';
import { DishType } from '@models/interfaces/dish-type.type';
import { IMenu } from '@models/interfaces/menu.interface';
import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { Day } from '@models/types/day.type';
import { getDays } from '@utility/get-days';
import { FirestoreService } from './firestore.service';
import { LocalStorageService } from './local-storage.service';
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
    private _userService: UserService,
  ) { }

  public get menuId$(): Observable<string> {
    return this._menuId$.pipe(
      shareReplay({ refCount: true, bufferSize: 1 })
    );
  }

  public get savedMenuId(): string | null {
    return this._localStorageService.getMenuId();
  }

  public selectMenu(id: string): void {
    this._localStorageService.setMenuId(id);
    this._menuId$.next(id);
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
      main: dishes.find(dish => dish.id === menu.contents[day].main),
      sides: dishes.filter(dish => menu.contents[day].sides.includes(dish.id)),
    }));
  }

  public getMenu(): Observable<IMenu | undefined> {
    return this._menuId$.pipe(
      filter(id => !!id),
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
      tap(async uid => {
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
                Monday: { main: null, sides: [] },
                Tuesday: { main: null, sides: [] },
                Wednesday: { main: null, sides: [] },
                Thursday: { main: null, sides: [] },
                Friday: { main: null, sides: [] },
                Saturday: { main: null, sides: [] },
                Sunday: { main: null, sides: [] },
              },
            }
          );
        }
      })
    );
  }

  public async deleteMenu(id: string): Promise<void> {
    await this._firestoreService.delete<IMenu>(this._endpoint, id);
    this._localStorageService.deleteMenuId();
    this._menuId$.next('');
  }

  public updateMenuName(id: string, name: string): Promise<void> {
    return this._updateMenu(id, { name });
  }

  public updateMenuContents({ day, dishId, dishType, selected }: {
    day: Day,
    dishId: string,
    dishType: DishType,
    selected: boolean,
  }): Observable<string | undefined> {
    return this.menuId$.pipe(
      first(),
      tap(async menuId => {
        if (!menuId) {
          return;
        }
        let updates: Partial<IMenu> = {};
        if (dishType === 'main') {
          updates = {
            [`contents.${day}.main`]: selected ? dishId : null
          };
        } else if (dishType === 'side') {
          updates = {
            [`contents.${day}.sides`]: selected
              ? firebase.firestore.FieldValue.arrayUnion(dishId)
              : firebase.firestore.FieldValue.arrayRemove(dishId)
          };
        }
        await this._updateMenu(menuId, updates);
      }),
    );
  }

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
            [`contents.${day}`]: { main: null, sides: [] }
          };
        } else {
          updates = {
            contents: {
              Monday: { main: null, sides: [] },
              Tuesday: { main: null, sides: [] },
              Wednesday: { main: null, sides: [] },
              Thursday: { main: null, sides: [] },
              Friday: { main: null, sides: [] },
              Saturday: { main: null, sides: [] },
              Sunday: { main: null, sides: [] },
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
}
