import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { concatMap, first, tap } from 'rxjs/operators';

import { TagDto } from '@models/dtos/tag-dto.interface';
import { Tag } from '@models/tag.interface';
import { AuthService } from './auth.service';
import { TagDocumentService } from './tag-document.service';

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor(
    private _authService: AuthService,
    private _tagDocumentService: TagDocumentService,
  ) { }

  public getTag(id: string): Observable<Tag | undefined> {
    return this._tagDocumentService.getTag(id);
  }

  public getTags(): Observable<Tag[]> {
    return this._tagDocumentService.getTags();
  }

  public createTag(tag: Partial<Omit<TagDto, 'id' | 'uid'>>): Observable<string | undefined> {
    return this._authService.uid$.pipe(
      first(),
      concatMap(async uid => {
        if (uid) {
          const id = this._tagDocumentService.createTag({ uid, tag });
          return id;
        } else {
          return undefined;
        }
      })
    );
  }

  public updateTag(id: string, updates: Partial<TagDto>): Promise<void> {
    return this._tagDocumentService.updateTag(id, updates);
  }

  public deleteTag(id: string): Observable<Tag | undefined> {
    return this.getTag(id).pipe(
      first(),
      tap(async tag => {
        if (!tag) {
          return;
        }
        await this._tagDocumentService.deleteTag(tag);
      })
    );
  }
}
