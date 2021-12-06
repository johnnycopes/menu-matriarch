import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { Tag } from '@models/interfaces/tag.interface';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiltersComponent {
  @Input() tags: Tag[] = [];
  @Input() selected: string[] = [];
  @Output() selectedChange = new EventEmitter<string[]>();
  public trackByFn = trackByFactory<Tag, string>(tag => tag.id);

  public onTagChange(id: string, state: boolean): void {
    let updated: string[] = [];
    if (state) {
      updated = [...this.selected, id];
    } else {
      updated = this.selected.filter(currentId => currentId !== id);
    }
    this.selectedChange.emit(updated);
  }
}
