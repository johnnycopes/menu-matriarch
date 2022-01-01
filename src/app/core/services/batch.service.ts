import { Injectable } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

import { MenuDto } from '@models/dtos/menu-dto.interface';
import { MealDto } from '@models/dtos/meal-dto.interface';
import { DishDto } from '@models/dtos/dish-dto.interface';
import { TagDto } from '@models/dtos/tag-dto.interface';
import { Dish } from '@models/dish.interface';
import { Tag } from '@models/tag.interface';
import { Meal } from '@models/meal.interface';
import { Menu } from '@models/menu.interface';
import { Day } from '@models/day.type';
import { createDishDto, createMealDto } from '@utility/domain/create-dtos';
import { dedupe } from '@utility/generic/dedupe';
import { flattenValues } from '@utility/generic/flatten-values';
import { DocumentService } from './document.service';
import { FirestoreService } from './firestore.service';

interface DocRefUpdate<TDocRef, TUpdates extends firebase.firestore.UpdateData> {
  docRef: DocumentReference<TDocRef>;
  updates: TUpdates;
}

@Injectable({
  providedIn: 'root'
})
export class BatchService {

  constructor(
    private _documentService: DocumentService,
    private _firestoreService: FirestoreService,
  ) { }

  public async createMeal({ uid, id, meal }: {
    uid: string,
    id: string,
    meal: Partial<Omit<MealDto, 'id' | 'uid'>>
  }): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.set(this._documentService.getMealDoc(id), createMealDto({ id, uid, ...meal }));
    if (meal.dishes) {
      meal.dishes.forEach(dishId => batch.update(
        this._documentService.getDishDoc(dishId),
        { meals: this._firestoreService.addToArray(id) }
      ));
    }
    if (meal.tags) {
      this._processUpdates(batch, this._getTagsMealUpdates({
        id,
        tagIds: [],
        updateTagIds: meal.tags,
      }));
    }
    await batch.commit();
  }

  public async createDish({ uid, id, dish }: {
    uid: string,
    id: string,
    dish: Partial<Omit<DishDto, 'id' | 'uid'>>
  }): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.set(this._documentService.getDishDoc(id), createDishDto({ id, uid, ...dish }));
    if (dish.tags) {
      this._processUpdates(batch, this._getTagsDishUpdates({
        id,
        tagIds: [],
        updateTagIds: dish.tags,
      }));
    }
    await batch.commit();
  }

  public async updateMenuContents({
    menu, dishIds, day, selected
  }: {
    menu: Menu,
    dishIds: string[],
    day: Day,
    selected: boolean,
  }): Promise<void> {
    const batch = this._firestoreService.getBatch();
    this._processUpdates(batch, [
      ...this._getDishesMenuUpdates({
        dishIds,
        menu,
        change: selected ? 'increment' : 'decrement'
      }),
      ...this._getMenusUpdates({
        menuIds: [menu.id],
        day,
        getDishes: selected
          ? () => this._firestoreService.addToArray(...dishIds)
          : () => this._firestoreService.removeFromArray(...dishIds)
      }),
    ]);
    await batch.commit();
  }

  public async updateMeal(
    meal: Meal,
    updates: Partial<MealDto>
  ): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.update(this._documentService.getMealDoc(meal.id), updates);
    if (updates.dishes) {
      this._processUpdates(batch, this._getDishUpdates({
        meal,
        updateDishIds: updates.dishes
      }));
    }
    if (updates.tags) {
      this._processUpdates(batch, this._getTagsMealUpdates({
        id: meal.id,
        tagIds: meal.tags.map(tag => tag.id),
        updateTagIds: updates.tags
      }));
    }
    await batch.commit();
  }

  public async updateDish(
    dish: Dish,
    updates: Partial<Omit<DishDto, 'usages' | 'menus'>>
  ): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.update(this._documentService.getDishDoc(dish.id), updates);
    if (updates.tags) {
      this._processUpdates(batch, this._getTagsDishUpdates({
        id: dish.id,
        tagIds: dish.tags.map(dish => dish.id),
        updateTagIds: updates.tags
      }));
    }
    await batch.commit();
  }

  public async deleteMenu(menu: Menu): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._documentService.getMenuDoc(menu.id));
    this._processUpdates(batch,
      this._getDishesMenuUpdates({
        dishIds: flattenValues(menu.contents),
        menu,
        change: 'clear'
      }),
    );
    await batch.commit();
  }

  public async deleteMenuContents(menu: Menu, day?: Day): Promise<void> {
    const batch = this._firestoreService.getBatch();
    // Clear a single day's contents
    if (day) {
      this._processUpdates(batch, [
        ...this._getMenusUpdates({ menuIds: [menu.id], day }),
        ...this._getDishesMenuUpdates({
          dishIds: menu.contents[day],
          menu,
          change: 'decrement'
        }),
      ]);
    }
    // Clear all days' contents
    else {
      this._processUpdates(batch, [
        ...this._getMenusUpdates({ menuIds: [menu.id] }),
        ...this._getDishesMenuUpdates({
          dishIds: flattenValues(menu.contents),
          menu,
          change: 'clear'
        }),
      ]);
    }
    await batch.commit();
  }

  public async deleteMeal(meal: Meal): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._documentService.getMealDoc(meal.id));
    this._processUpdates(batch, [
      ...this._getDishesMealUpdates({
        meal,
        action: 'delete',
      }),
      ...this._getTagsMealUpdates({
        id: meal.id,
        tagIds: meal.tags.map(tag => tag.id),
      }),
    ]);
    await batch.commit();
  }

  public async deleteDish(dish: Dish): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._documentService.getDishDoc(dish.id));
    this._processUpdates(batch, [
      ...this._getMenusUpdates({
        menuIds: dish.menus,
        getDishes: () => this._firestoreService.removeFromArray(dish.id)
      }),
      ...this._getTagsDishUpdates({
        id: dish.id,
        tagIds: dish.tags.map(dish => dish.id),
      }),
    ]);
    await batch.commit();
  }

  public async deleteTag(tag: Tag): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._documentService.getTagDoc(tag.id));
    tag.meals
      .map(mealId => this._documentService.getMealDoc(mealId))
      .forEach(meal => batch.update(meal, {
        tags: this._firestoreService.removeFromArray(tag.id)
      }));
    tag.dishes
      .map(dishId => this._documentService.getDishDoc(dishId))
      .forEach(dish => batch.update(dish, {
        tags: this._firestoreService.removeFromArray(tag.id)
      }));
    await batch.commit();
  }

  private _getMenusUpdates({ menuIds, day, getDishes = () => [] }: {
    menuIds: string[],
    day?: Day,
    getDishes?: () => string[],
  }): DocRefUpdate<MenuDto, { [key: string]: string[] }>[] {
    let updates = {};
    if (day) {
      updates = this._getMenuDayDishes(day, getDishes());
    } else {
      updates = {
        ...this._getMenuDayDishes('Monday', getDishes()),
        ...this._getMenuDayDishes('Tuesday', getDishes()),
        ...this._getMenuDayDishes('Wednesday', getDishes()),
        ...this._getMenuDayDishes('Thursday', getDishes()),
        ...this._getMenuDayDishes('Friday', getDishes()),
        ...this._getMenuDayDishes('Saturday', getDishes()),
        ...this._getMenuDayDishes('Sunday', getDishes()),
      };
    }
    return menuIds.map(menuId => ({
      docRef: this._documentService.getMenuDoc(menuId),
      updates,
    }));
  }

  private _getDishesMenuUpdates({ dishIds, menu, change }: {
    dishIds: string[],
    menu: Menu,
    change: 'increment' | 'decrement' | 'clear',
  }): DocRefUpdate<DishDto, { usages: number, menus?: string[] }>[] {
    const dishCounts = flattenValues(menu.contents)
      .reduce((hashMap, dishId) => ({
        ...hashMap,
        [dishId]: hashMap[dishId] ? hashMap[dishId] + 1 : 1
      }), {} as { [dishId: string]: number });

    return dishIds.map(dishId => {
      const dishCount = dishCounts[dishId] ?? 0;
      let menusChange = 0;
      if (dishCount === 0 && change === 'increment') {
        menusChange = 1;
      } else if ((dishCount === 1 && change === 'decrement') || change === 'clear') {
        menusChange = -1;
      }
      const menus = menusChange > 0
        ? this._firestoreService.addToArray(menu.id)
        : this._firestoreService.removeFromArray(menu.id);
      return {
        docRef: this._documentService.getDishDoc(dishId),
        updates: {
          usages: this._firestoreService.changeCounter(change === 'increment' ? 1 : -1),
          ...(menusChange !== 0 && { menus }), // only include `menus` if `menusChange` isn't 0
        },
      };
    });
  }

  private _getDishesMealUpdates({ meal, action }: {
    meal: Meal,
    action: 'delete',
  }): DocRefUpdate<DishDto, { meals: string[] }>[] {
    return meal.dishes.map(dish => ({
      docRef: this._documentService.getDishDoc(dish.id),
      updates: {
        meals: this._firestoreService.removeFromArray(meal.id),
      },
    }));
  }

  private _getDishUpdates({ meal, updateDishIds = [] }: {
    meal: Meal,
    updateDishIds?: string[],
  }): DocRefUpdate<DishDto, { meals: string[] }>[] {
    const dishIds = meal.dishes.map(dish => dish.id)
    const dishUpdates = [];
    for (let id of dedupe(dishIds, updateDishIds)) {
      let meals = undefined;

      if (dishIds.includes(id) && !updateDishIds.includes(id)) {
        meals = this._firestoreService.removeFromArray(meal.id);
      } else if (!dishIds.includes(id) && updateDishIds.includes(id)) {
        meals = this._firestoreService.addToArray(meal.id);
      }

      if (meals) {
        dishUpdates.push({
          docRef: this._documentService.getDishDoc(id),
          updates: { meals },
        });
      }
    }
    return dishUpdates;
  }

  private _getTagsMealUpdates({ id, tagIds, updateTagIds = [] }: {
    id: string,
    tagIds: string[],
    updateTagIds?: string[],
  }): DocRefUpdate<TagDto, { meals: string[] }>[] {
    const tagUpdates = [];
    for (let tagId of dedupe(tagIds, updateTagIds)) {
      let meals = undefined;

      if (tagIds.includes(tagId) && !updateTagIds.includes(tagId)) {
        meals = this._firestoreService.removeFromArray(id);
      } else if (!tagIds.includes(tagId) && updateTagIds.includes(tagId)) {
        meals = this._firestoreService.addToArray(id);
      }

      if (meals) {
        tagUpdates.push({
          docRef: this._documentService.getTagDoc(tagId),
          updates: { meals },
        });
      }
    }
    return tagUpdates;
  }

  private _getTagsDishUpdates({ id, tagIds, updateTagIds = [] }: {
    id: string,
    tagIds: string[],
    updateTagIds?: string[],
  }): DocRefUpdate<TagDto, { dishes: string[] }>[] {
    const tagUpdates = [];
    for (let tagId of dedupe(tagIds, updateTagIds)) {
      let dishes = undefined;

      if (tagIds.includes(tagId) && !updateTagIds.includes(tagId)) {
        dishes = this._firestoreService.removeFromArray(id);
      } else if (!tagIds.includes(tagId) && updateTagIds.includes(tagId)) {
        dishes = this._firestoreService.addToArray(id);
      }

      if (dishes) {
        tagUpdates.push({
          docRef: this._documentService.getTagDoc(tagId),
          updates: { dishes },
        });
      }
    }
    return tagUpdates;
  }

  private _getMenuDayDishes(day: Day, dishes: string[]): { [contentsDay: string]: string[] } {
    return { [`contents.${day}`]: dishes };
  }

  private _processUpdates(
    batch: firebase.firestore.WriteBatch,
    docRefUpdates: DocRefUpdate<any, any>[]
  ): void {
    docRefUpdates.forEach(
      ({ docRef, updates }) => batch.update(docRef, updates)
    );
  }
}
