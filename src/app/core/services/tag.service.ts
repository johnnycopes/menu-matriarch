import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { concatMap, first, map, switchMap, tap } from 'rxjs/operators';

import { Endpoint } from '@models/endpoint.enum';
import { TagDto } from '@models/dtos/tag-dto.interface';
import { Tag } from '@models/tag.interface';
import { createTagDto } from '@shared/utility/domain/create-dtos';
import { lower } from '@utility/generic/format';
import { sort } from '@utility/generic/sort';
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
    return this._firestoreService.getOne<TagDto>(this._endpoint, id);
  }

  public getTags(): Observable<Tag[]> {
    return this._userService.uid$.pipe(
      switchMap(uid => this._firestoreService.getMany<TagDto>(this._endpoint, uid)),
      map(tags => sort(tags, tag => lower(tag.name)))
    );
  }

  public createTag(tag: Partial<Omit<TagDto, 'id' | 'uid'>>): Observable<string | undefined> {
    return this._userService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._firestoreService.createId();
          await this._firestoreService.create<TagDto>(
            this._endpoint,
            id,
            createTagDto({ id, uid, ...tag })
          );
          return id;
        } else {
          return undefined;
        }
      })
    );
  }

  public updateTag(id: string, updates: Partial<TagDto>): Promise<void> {
    return this._firestoreService.update<TagDto>(this._endpoint, id, updates);
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
