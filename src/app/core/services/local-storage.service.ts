
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private _prefix = 'MENU_MATRIARCH_';
  private _menuId$ = new BehaviorSubject<string | null>(null);

  constructor() { }

  public getMenuId(): string | null {
    const id = window.localStorage.getItem(this._prefix + 'MENU_ID');
    this._menuId$.next(id);
    return id;
  }

  public watchMenuId(): Observable<string | null> {
    this.getMenuId();
    return this._menuId$.pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
      distinctUntilChanged(),
    );
  }

  public setMenuId(id: string): void {
    this._menuId$.next(id);
    window.localStorage.setItem(this._prefix + 'MENU_ID', id);
  }

  public deleteMenuId(): void {
    this._menuId$.next(null);
    window.localStorage.removeItem(this._prefix + 'MENU_ID');
  }
}
