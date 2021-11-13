import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { concatMap, first, map, switchMap } from 'rxjs/operators';

import { ITagDbo } from '@models/dbos/tag-dbo.interface';
import { ITag } from '@models/interfaces/tag.interface';
import { sort } from '@shared/utility/sort';
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
    return this._firestoreService.getOne<ITagDbo>(this._endpoint, id);
  }

  public getTags(): Observable<ITag[]> {
    return this._userService.uid$.pipe(
      switchMap(uid => this._firestoreService.getMany<ITagDbo>(this._endpoint, uid)),
      map(tags => sort(tags, tag => tag.name.toLowerCase()))
    );
  }

  public createTag(name: string): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._firestoreService.createId();
          await this._firestoreService.create<ITagDbo>(
            this._endpoint,
            id,
            {
              id,
              uid,
              name,
              color: '',
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

  public updateTag(id: string, updates: Partial<ITagDbo>): Promise<void> {
    return this._firestoreService.update<ITagDbo>(this._endpoint, id, updates);
  }

  public deleteTag(id: string): Promise<void> {
    return this._firestoreService.delete<ITagDbo>(this._endpoint, id);
  }
}
