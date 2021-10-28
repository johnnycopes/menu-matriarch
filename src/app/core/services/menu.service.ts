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
      switchMap(this._firestoreService.getMenu)
    );
  }

  public getMenus(): Observable<IMenu[]> {
    return this._userService.getData(this._firestoreService.getMenus);
  }

  public createMenu(name: string): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      tap(async uid => {
        if (uid) {
          await this._firestoreService.createMenu(uid, name);
        }
      })
    );
  }

  public updateMenuName(id: string, name: string): Promise<void> {
    return this._firestoreService.updateMenu(id, { name });
  }

  public updateMenuContents({ day, mealId }: {
    day: Day,
    mealId: string | null
  }): Observable<string | undefined> {
    return this.menuId$.pipe(
      first(),
      tap(async menuId => {
        await this._firestoreService.updateMenu(
          menuId,
          { [`contents.${day}`]: mealId },
        );
      }),
    );
  }

  public deleteMenu(id: string): Promise<void> {
    return this._firestoreService.deleteMenu(id);
  }

  public clearMenuContents(): Observable<string | undefined> {
    return this.menuId$.pipe(
      first(),
      tap(async menuId => {
        await this._firestoreService.updateMenu(
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
    return this._userService.getUser().pipe(
      map(user => getDays(user?.preferences?.menuStartDay)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }
}
