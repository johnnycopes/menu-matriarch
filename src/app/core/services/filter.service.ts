import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { Dish } from '@models/dish.interface';
import { FilteredDishesGroup } from '@models/filtered-dishes.interface';
import { Meal } from '@models/meal.interface';
import { Tag } from '@models/tag.interface';
import { getDishTypes } from '@utility/domain/get-dish-types';
import { includes } from '@utility/generic/includes';

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

  public filterMeals({ meals, text, tagIds }: {
    meals: Meal[],
    text: string,
    tagIds: string[],
  }): Meal[] {
    return meals.filter(meal => {
      return this._filterEntity({
        name: meal.name, description: meal.description, tags: meal.tags, text, tagIds,
      }) || meal.dishes.some(dish => this._filterEntity({
        name: dish.name, description: dish.description, tags: [], text, tagIds,
      }));
    });
  }

  public filterDishes({ dishes, text, tagIds }: {
    dishes: Dish[],
    text: string,
    tagIds: string[],
  }): FilteredDishesGroup[] {
    return getDishTypes().map(type => ({
      type,
      dishes: dishes.filter(dish =>
        dish.type === type && this._filterEntity({
          name: dish.name,
          description: dish.description,
          tags: dish.tags,
          text,
          tagIds,
        })
      ),
      placeholderText: `No ${type !== 'dessert'
        ? `${type} dishes`
        : `${type}s`} to display`,
    }));
  }

  private _filterEntity({ name, description, tags, text, tagIds }: {
    name: string,
    description: string,
    tags: Tag[],
    text: string,
    tagIds: string[],
  }): boolean {
    return (tagIds.length === 0 || tags.some(tag => tagIds.includes(tag.id)))
      && includes([name, description, ...tags.map(tag => tag.name)], text);
  }
}
