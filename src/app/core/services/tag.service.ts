import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { concatMap, first, map, switchMap, tap } from 'rxjs/operators';

import { Endpoint } from '@models/enums/endpoint.enum';
import { TagDbo } from '@models/dbos/tag-dbo.interface';
import { Tag } from '@models/interfaces/tag.interface';
import { lower } from '@shared/utility/format';
import { sort } from '@shared/utility/sort';
import { FirestoreService } from './firestore.service';
import { BatchService } from './batch.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private _endpoint = Endpoint.tags;

  constructor(
    private _firestoreService: FirestoreService,
    private _batchService: BatchService,
    private _userService: UserService,
  ) { }

  public getTag(id: string): Observable<Tag | undefined> {
    return this._firestoreService.getOne<TagDbo>(this._endpoint, id);
  }

  public getTags(): Observable<Tag[]> {
    return this._userService.uid$.pipe(
      switchMap(uid => this._firestoreService.getMany<TagDbo>(this._endpoint, uid)),
      map(tags => sort(tags, tag => lower(tag.name)))
    );
  }

  public createTag(name: string): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._firestoreService.createId();
          await this._firestoreService.create<TagDbo>(
            this._endpoint,
            id,
            {
              id,
              uid,
              name,
              color: '',
              dishes: [],
            }
          );
          return id;
        } else {
          return undefined;
        }
      })
    );
  }

  public updateTag(id: string, updates: Partial<TagDbo>): Promise<void> {
    return this._firestoreService.update<TagDbo>(this._endpoint, id, updates);
  }

  public deleteTag(id: string): Observable<Tag | undefined> {
    return this.getTag(id).pipe(
      first(),
      tap(async tag => {
        if (!tag) {
          return;
        }
        await this._batchService.deleteTag(tag);
      })
    );
  }
}
