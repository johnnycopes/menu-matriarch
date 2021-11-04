import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, HostListener, HostBinding } from '@angular/core';

@Component({
	selector: '[app-options-menu-item]',
	templateUrl: './options-menu-item.component.html',
	styleUrls: ['./options-menu-item.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionsMenuItemComponent {
  @Input()
  @HostBinding('attr.disabled')
  @HostBinding('class.disabled')
  disabled = false;
}
