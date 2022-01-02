import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Dish } from '@models/dish.interface';
import { DishDto } from '@models/dtos/dish-dto.interface';
import { Endpoint } from '@models/endpoint.enum';
import { Tag } from '@models/tag.interface';
import { createDishDto } from '@utility/domain/create-dtos';
import { sort } from '@utility/generic/sort';
import { lower } from '@utility/generic/format';
import { FirestoreService } from './firestore.service';
import { TagService } from './tag.service';
import { UserService } from './user.service';
import { DocumentService } from './document.service';

@Injectable({
  providedIn: 'root'
})
export class DishDocumentService {
  private _endpoint = Endpoint.dishes;

  constructor(
    private _documentService: DocumentService,
    private _firestoreService: FirestoreService,
    private _tagService: TagService,
    private _userService: UserService,
  ) { }

  public getDish(id: string): Observable<Dish | undefined> {
    return combineLatest([
      this._firestoreService.getOne<DishDto>(this._endpoint, id),
      this._tagService.getTags(),
    ]).pipe(
      map(([dish, tags]) => {
        if (!dish) {
          return undefined;
        }
        return this._getDish(dish, tags);
      })
    );
  }

  public getDishes(): Observable<Dish[]> {
    return combineLatest([
      this._userService.uid$.pipe(
        switchMap(uid => this._firestoreService.getMany<DishDto>(this._endpoint, uid)),
        map(dishes => sort(dishes, dish => lower(dish.name)))
      ),
      this._tagService.getTags(),
    ]).pipe(
      map(([dishes, tags]) => dishes.map(dish => this._getDish(dish, tags)))
    );
  }

  public async createDish({ uid, dish }: {
    uid: string,
    dish: Partial<Omit<DishDto, 'id' | 'uid'>>
  }): Promise<string> {
    const id = this._firestoreService.createId();
    const batch = this._firestoreService.getBatch();
    batch.set(
      this._documentService.getDishDoc(id),
      createDishDto({ id, uid, ...dish }),
    );
    if (dish.tags) {
      this._documentService.processUpdates(
        batch,
        this._documentService.getUpdatedTagDocs({
          key: 'dishes',
          initialTagIds: [],
          finalTagIds: dish.tags,
          entityId: id,
        }),
      );
    }
    await batch.commit();
    return id;
  }

  public async updateDish(
    dish: Dish,
    updates: Partial<Omit<DishDto, 'usages' | 'menus'>>
  ): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.update(this._documentService.getDishDoc(dish.id), updates);
    if (updates.tags) {
      this._documentService.processUpdates(
        batch,
        this._documentService.getUpdatedTagDocs({
          key: 'dishes',
          initialTagIds: dish.tags.map(tag => tag.id),
          finalTagIds: updates.tags,
          entityId: dish.id,
        }),
      );
    }
    await batch.commit();
  }

  private _getDish(dish: DishDto, tags: Tag[]): Dish {
    return {
      ...dish,
      tags: tags.filter(tag => dish.tags.includes(tag.id))
    };
  }
}
