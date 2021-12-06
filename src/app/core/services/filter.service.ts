import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, first } from 'rxjs/operators';

import { Dish } from '@models/interfaces/dish.interface';
import { DishType } from '@models/types/dish-type.type';
import { lower } from '@shared/utility/format';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private _panel$ = new BehaviorSubject<boolean>(false);
  private _tagIds$ = new BehaviorSubject<string[]>([]);
  private _text$ = new BehaviorSubject<string>('');

  public get panel$(): Observable<boolean> {
    return this._panel$.pipe(
      distinctUntilChanged(),
    );
  }

  public get tagIds$(): Observable<string[]> {
    return this._tagIds$.pipe(
      distinctUntilChanged(),
    );
  }

  public get text$(): Observable<string> {
    return this._text$.pipe(
      distinctUntilChanged(),
    );
  }

  public updatePanel(state: boolean): void {
    this._panel$.next(state);
  }

  public togglePanel(): void {
    this.panel$.pipe(
      first(),
    ).subscribe(value => this._panel$.next(!value));
  }

  public updateTagIds(ids: string[]): void {
    this._tagIds$.next(ids);
  }

  public updateText(text: string): void {
    this._text$.next(text);
  }

  public filterDish({ dish, type, text, tagIds }: {
    dish: Dish,
    type: DishType,
    text: string,
    tagIds: string[],
  }): boolean {
    return dish.type === type &&
      (tagIds.length === 0 || dish.tags.some(tag => tagIds.includes(tag.id))) &&
      (lower(dish.name).includes(lower(text)) ||
      lower(dish.description).includes(lower(text)) ||
      dish.tags.some(tag => lower(tag.name).includes(lower(text))));
  }
}
