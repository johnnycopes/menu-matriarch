import { Component, Input, ChangeDetectionStrategy, HostBinding, ViewEncapsulation } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';

type ButtonStyle = 'primary' | 'secondary' | 'ternary' | 'danger';

@Component({
  selector: '[app-button]',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ButtonComponent {
  @Input() buttonStyle: ButtonStyle = 'primary';
  @Input() icon: IconDefinition | undefined;

  @HostBinding('class')
  public get hostClasses(): string[] {
    return ['app-button', `app-button--${this.buttonStyle}`];
  }
}
