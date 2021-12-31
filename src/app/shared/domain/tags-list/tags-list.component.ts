import { Component, ChangeDetectionStrategy, Input, TemplateRef, ContentChild } from '@angular/core';
import { Tag } from '@models/tag.interface';
import { trackById } from '@shared/utility/domain/track-by-functions';

@Component({
  selector: 'app-tags-list',
  templateUrl: './tags-list.component.html',
  styleUrls: ['./tags-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagsListComponent<T extends Tag> {
  @Input() tags: T[] = [];
  @Input() interactive = false;
  public readonly trackByFn = trackById;

  @ContentChild('tagTemplate')
  public tagTemplate: TemplateRef<any> | null = null;
}
