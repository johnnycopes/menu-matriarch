import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: CheckboxComponent,
    multi: true
  }]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() disabled: boolean = false;
  @Input() indeterminate: boolean = false;
  @Input() bold: boolean = false;
  @Input() invertColors: boolean = false;
  public checked: boolean = false;
  private _onChangeFn: (value: boolean) => void = (_) => undefined;

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  writeValue(value: boolean): void {
    this.checked = value;
    this._changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this._onChangeFn = fn;
  }

  registerOnTouched(_fn: (value: boolean) => void): void { }

  onChange(value: boolean): void {
    this.checked = value;
    this._onChangeFn(this.checked);
  }
}
