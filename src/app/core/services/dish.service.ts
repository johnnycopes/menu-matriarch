import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { concatMap, first, map, switchMap } from 'rxjs/operators';

import { IDish } from '@models/interfaces/dish.interface';
import { DishType } from '@models/types/dish-type.type';
import { FirestoreService } from './firestore.service';
import { TagService } from './tag.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class DishService {
  private _endpoint = 'dishes';

  constructor(
    private _firestoreService: FirestoreService,
    private _tagService: TagService,
    private _userService: UserService,
  ) { }

  public getDish(id: string): Observable<IDish | undefined> {
    return this._firestoreService.getOne<IDish>(this._endpoint, id);
  }

  public getDishTags(id: string) {
    return combineLatest([
      this.getDish(id).pipe(
        map(dish => dish?.tags ?? [])
      ),
      this._tagService.getTags(),
    ]).pipe(
      map(([dishTags, tags]) =>  tags.filter(tag => dishTags.includes(tag.id)))
    );
  }

  public getDishes(): Observable<IDish[]> {
    return this._userService.uid$.pipe(
      switchMap(uid => this._firestoreService.getMany<IDish>(this._endpoint, uid))
    );
  }

  public createDish(
    { name, description, type }: { name: string, description: string, type: DishType }
  ): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._firestoreService.createId();
          await this._firestoreService.create<IDish>(
            this._endpoint,
            id,
            {
              id,
              uid,
              name,
              description,
              type,
              favorited: false,
              ingredients: [],
              tags: [],
              menus: [],
              usages: 0,
            }
          );
          return id;
        } else {
          return undefined;
        }
      })
    );
  }

  public updateDish(id: string, updates: Partial<IDish>): Promise<void> {
    return this._firestoreService.update<IDish>(this._endpoint, id, updates);
  }

  public deleteDish(id: string): Promise<void> {
    return this._firestoreService.delete<IDish>(this._endpoint, id);
  }
}
