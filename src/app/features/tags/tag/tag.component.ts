import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';
import { Subject, merge } from 'rxjs';
import { mapTo, shareReplay } from 'rxjs/operators';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-tag]',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagComponent {
  @Input() id = '';
  @Input() name = '';
  @Input() dishes: string[] = [];
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

  public onSave(name: string): void {
    this.finishEdit$.next();
    this.edit.emit(name);
  }
}
