import { ChangeDetectionStrategy, Component } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { mapTo, shareReplay } from 'rxjs/operators';

import { Tag } from '@models/interfaces/tag.interface';
import { TagService } from '@services/tag.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-tags-form',
  templateUrl: './tags-form.component.html',
  styleUrls: ['./tags-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsFormComponent {
  public tags$ = this._tagService.getTags();
  public startAdd$ = new Subject<void>();
  public finishAdd$ = new Subject<void>();
  public adding$ = merge(
    this.startAdd$.pipe(mapTo(true)),
    this.finishAdd$.pipe(mapTo(false)),
  ).pipe(
    shareReplay({ refCount: true, bufferSize: 1 })
  );
  public trackByFn = trackByFactory<Tag, string>(tag => tag.id);

  constructor(private _tagService: TagService) { }

  public onNewTagSave(name: string): void {
    this._tagService
      .createTag(name)
      .subscribe();
    this.finishAdd$.next();
  }

  public onTagEdit(id: string, name: string): void {
    this._tagService.updateTag(id, { name });
  }

  public onTagDelete(id: string): void {
    this._tagService.deleteTag(id);
  }
}
