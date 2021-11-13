import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';
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
  @Input() usages = 0;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<void>();
  public startEdit$ = new Subject<void>();
  public finishEdit$ = new Subject<void>();
  public editing$ = merge(
    this.startEdit$.pipe(mapTo(true)),
    this.finishEdit$.pipe(mapTo(false)),
  ).pipe(
    shareReplay({ refCount: true, bufferSize: 1 })
  );
  public readonly faUtensils = faUtensils;

  public onSave(name: string): void {
    this.finishEdit$.next();
    this.edit.emit(name);
  }
}
