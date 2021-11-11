import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { concatMap, first, switchMap } from 'rxjs/operators';

import { ITag } from '@models/interfaces/tag.interface';
import { FirestoreService } from './firestore.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private _endpoint = 'tags';

  constructor(
    private _firestoreService: FirestoreService,
    private _userService: UserService,
  ) { }

  public getTag(id: string): Observable<ITag | undefined> {
    return this._firestoreService.getOne<ITag>(this._endpoint, id);
  }

  public getTags(): Observable<ITag[]> {
    return this._userService.uid$.pipe(
      switchMap(uid => this._firestoreService.getMany<ITag>(this._endpoint, uid))
    );
  }

  public createTag(name: string): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._firestoreService.createId();
          await this._firestoreService.create<ITag>(
            this._endpoint,
            id,
            {
              id,
              uid,
              name,
              color: ''
            }
          );
          return id;
        } else {
          return undefined;
        }
      })
    );
  }

  public updateTag(id: string, updates: Partial<ITag>): Promise<void> {
    return this._firestoreService.update<ITag>(this._endpoint, id, updates);
  }

  public deleteTag(id: string): Promise<void> {
    return this._firestoreService.delete<ITag>(this._endpoint, id);
  }
}
