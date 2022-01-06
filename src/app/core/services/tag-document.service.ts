import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Endpoint } from '@models/endpoint.enum';
import { Tag } from '@models/tag.interface';
import { TagDto } from '@models/dtos/tag-dto.interface';
import { createTagDto } from '@utility/domain/create-dtos';
import { lower } from '@utility/generic/format';
import { sort } from '@utility/generic/sort';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { DocumentService } from './document.service';

@Injectable({
  providedIn: 'root'
})
export class TagDocumentService {
  private _endpoint = Endpoint.tags;

  constructor(
    private _apiService: ApiService,
    private _authService: AuthService,
    private _documentService: DocumentService,
  ) { }

  public getTag(id: string): Observable<Tag | undefined> {
    return this._apiService.getOne<TagDto>(this._endpoint, id);
  }

  public getTags(): Observable<Tag[]> {
    return this._authService.uid$.pipe(
      switchMap(uid => this._apiService.getMany<TagDto>(this._endpoint, uid)),
      map(tags => sort(tags, tag => lower(tag.name)))
    );
  }

  public async createTag({ uid, tag }: {
    uid: string,
    tag: Partial<Omit<TagDto, 'id' | 'uid'>>
  }): Promise<string> {
    const id = this._apiService.createId();
    await this._apiService.create<TagDto>(
      this._endpoint,
      id,
      createTagDto({ id, uid, ...tag })
    );
    return id;
  }

  public updateTag(id: string, updates: Partial<TagDto>): Promise<void> {
    return this._apiService.update<TagDto>(this._endpoint, id, updates);
  }

  public async deleteTag(tag: Tag): Promise<void> {
    const batch = this._apiService.createBatch();
    batch.delete(this._documentService.getTagDoc(tag.id));
    this._documentService.processUpdates(batch, [
      ...this._documentService.getMealUpdates({
        key: 'tags',
        initialMealIds: tag.meals,
        finalMealIds: [],
        entityId: tag.id,
      }),
      ...this._documentService.getDishUpdates({
        key: 'tags',
        initialDishIds: tag.dishes,
        finalDishIds: [],
        entityId: tag.id,
      }),
    ]);
    await batch.commit();
  }
}
