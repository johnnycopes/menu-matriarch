import { Component, Input, ChangeDetectionStrategy, HostBinding, ViewEncapsulation } from '@angular/core';

type ButtonStyle = 'primary' | 'secondary' | 'ternary';

@Component({
  selector: '[app-button]',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ButtonComponent {
  @Input() buttonStyle: ButtonStyle = 'primary';

  @HostBinding('class')
  public get classes(): Record<string, boolean> {
    return {
      'app-button': true,
      'app-button--primary': this.buttonStyle === 'primary',
      'app-button--secondary': this.buttonStyle === 'secondary',
      'app-button--ternary': this.buttonStyle === 'ternary',
    };
  }
}
