import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';

import { optionsMenuAnimation } from './options-menu-animation';

@Component({
	selector: 'ul[app-options-menu]',
	templateUrl: './options-menu.component.html',
	styleUrls: ['./options-menu.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [optionsMenuAnimation]
})
export class OptionsMenuComponent {
	@HostBinding('@menuAnimation')
  public animation = true;
}
