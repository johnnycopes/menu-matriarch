import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { Dish } from '@models/dish.interface';
import { DishType } from '@models/dish-type.type';
import { FilteredDishesGroup } from '@models/filtered-dishes.interface';
import { getDishTypes } from '@shared/utility/domain/get-dish-types';
import { lower } from '@utility/generic/format';

interface State {
  panel: boolean;
  tagIds: string[];
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private _state$ = new BehaviorSubject<State>({
    panel: false,
    tagIds: [],
    text: '',
  });

  public get state$(): Observable<State> {
    return this._state$.asObservable();
  }

  public togglePanel(): void {
    this._state$.pipe(
      first(),
    ).subscribe(state => this._state$.next({ ...state, panel: !state.panel }));
  }

  public updateTagIds(tagIds: string[]): void {
    this._state$.pipe(
      first(),
    ).subscribe(state => this._state$.next({ ...state, tagIds }));
  }

  public updateText(text: string): void {
    this._state$.pipe(
      first(),
    ).subscribe(state => this._state$.next({ ...state, text }));
  }

  public getTotalCount(filteredDishes: FilteredDishesGroup[]): number {
    return filteredDishes.reduce((total, { dishes }) => total + dishes.length, 0);
  }

  public filterDishes({ dishes, text, tagIds }: {
    dishes: Dish[],
    text: string,
    tagIds: string[],
  }): FilteredDishesGroup[] {
    return getDishTypes().map(type => ({
      type,
      dishes: dishes.filter(dish => this._filterDish({
        dish, type, text, tagIds
      })),
      placeholderText: `No ${type !== 'dessert'
        ? `${type} dishes`
        : `${type}s`} to display`,
    }));
  }

  private _filterDish({ dish, type, text, tagIds }: {
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
