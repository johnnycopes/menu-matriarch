import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, first, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { IMeal } from '@models/interfaces/meal.interface';
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

  public getMenuEntries({ days, meals, menu }: {
    days: Day[],
    menu: IMenu | undefined,
    meals: IMeal[],
  }): IMenuEntry[] {
    if (!menu) {
      return [];
    }
    return days.map(day => ({
      day,
      meal: meals.find(meal => meal.id === menu.contents[day]),
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
                Monday: null,
                Tuesday: null,
                Wednesday: null,
                Thursday: null,
                Friday: null,
                Saturday: null,
                Sunday: null,
              },
            }
          );
        }
      })
    );
  }

  public updateMenuName(id: string, name: string): Promise<void> {
    return this._updateMenu(id, { name });
  }

  public updateMenuContents({ day, mealId }: {
    day: Day,
    mealId: string | null
  }): Observable<string | undefined> {
    return this.menuId$.pipe(
      first(),
      tap(async menuId => {
        if (!menuId) {
          return;
        }
        await this._updateMenu(
          menuId,
          { [`contents.${day}`]: mealId },
        );
      }),
    );
  }

  public async deleteMenu(id: string): Promise<void> {
    await this._firestoreService.delete<IMenu>(this._endpoint, id);
    this._localStorageService.deleteMenuId();
    this._menuId$.next('');
  }

  public clearMenuContents(): Observable<string | undefined> {
    return this.menuId$.pipe(
      first(),
      tap(async menuId => {
        if (!menuId) {
          return;
        }
        await this._updateMenu(
          menuId,
          { contents: {
            Monday: null,
            Tuesday: null,
            Wednesday: null,
            Thursday: null,
            Friday: null,
            Saturday: null,
            Sunday: null,
          }}
        );
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
