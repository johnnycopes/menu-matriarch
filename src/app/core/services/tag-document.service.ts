import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Endpoint } from '@models/endpoint.enum';
import { Tag } from '@models/tag.interface';
import { TagDto } from '@models/dtos/tag-dto.interface';
import { createTagDto } from '@utility/domain/create-dtos';
import { lower } from '@utility/generic/format';
import { sort } from '@utility/generic/sort';
import { DocumentService } from './document.service';
import { FirestoreService } from './firestore.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class TagDocumentService {
  private _endpoint = Endpoint.tags;

  constructor(
    private _documentService: DocumentService,
    private _firestoreService: FirestoreService,
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

  public async createTag({ uid, tag }: {
    uid: string,
    tag: Partial<Omit<TagDto, 'id' | 'uid'>>
  }): Promise<string> {
    const id = this._firestoreService.createId();
    await this._firestoreService.create<TagDto>(
      this._endpoint,
      id,
      createTagDto({ id, uid, ...tag })
    );
    return id;
  }

  public updateTag(id: string, updates: Partial<TagDto>): Promise<void> {
    return this._firestoreService.update<TagDto>(this._endpoint, id, updates);
  }

  public async deleteTag(tag: Tag): Promise<void> {
    const batch = this._firestoreService.getBatch();
    batch.delete(this._documentService.getTagDoc(tag.id));
    this._documentService.processUpdates(batch, [
      ...this._documentService.getUpdatedMealDocs({
        key: 'tags',
        initialMealIds: tag.meals,
        finalMealIds: [],
        entityId: tag.id,
      }),
      ...this._documentService.getUpdatedDishDocs({
        key: 'tags',
        initialDishIds: tag.dishes,
        finalDishIds: [],
        entityId: tag.id,
      }),
    ]);
    await batch.commit();
  }
}
