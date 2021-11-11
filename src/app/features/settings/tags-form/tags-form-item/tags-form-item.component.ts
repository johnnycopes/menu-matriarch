import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { mapTo, shareReplay } from 'rxjs/operators';

@Component({
  selector: '[app-tags-form-item]',
  templateUrl: './tags-form-item.component.html',
  styleUrls: ['./tags-form-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsFormItemComponent {
  @Input() id = '';
  @Input() name = '';
  @Output() edit = new EventEmitter<string>();
  public startEdit$ = new Subject<void>();
  public finishEdit$ = new Subject<void>();
  public editing$ = merge(
    this.startEdit$.pipe(mapTo(true)),
    this.finishEdit$.pipe(mapTo(false)),
  ).pipe(
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  public onSave(name: string): void {
    this.finishEdit$.next();
    this.edit.emit(name);
  }
}
