import { Component, Input, ChangeDetectionStrategy, HostBinding } from '@angular/core';

type ButtonStyle = 'primary' | 'secondary' | 'ternary';

@Component({
  selector: '[app-button]',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @HostBinding('class')
  @Input() buttonStyle: ButtonStyle = 'primary';
}
