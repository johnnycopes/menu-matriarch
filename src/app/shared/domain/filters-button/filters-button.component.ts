import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-filters-button',
  templateUrl: './filters-button.component.html',
  styleUrls: ['./filters-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiltersButtonComponent {
  @Input() count = 0;
  @Input() open = false;
  @Output() clicked = new EventEmitter<void>();
}
