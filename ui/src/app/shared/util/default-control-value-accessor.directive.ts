import { Directive, OnInit, Self, Signal } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';

@Directive()
export abstract class DefaultControlValueAccessor<T> implements OnInit, ControlValueAccessor {
  control: FormControl<T> | null;

  abstract formFieldControl: Signal<MatFormFieldControl<unknown>>;

  constructor(@Self() protected readonly ngControl: NgControl) {
    ngControl.valueAccessor = this;
  }

  ngOnInit(): void {
    this.control = this.ngControl.control as FormControl;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnChange(fn: any): void {
    this.getValueAccessor()?.registerOnChange(fn);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnTouched(fn: any): void {
    this.getValueAccessor()?.registerOnTouched(fn);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writeValue(obj: any): void {
    this.getValueAccessor()?.writeValue(obj);
  }

  setDisabledState(isDisabled: boolean): void {
    this.getValueAccessor()?.setDisabledState?.(isDisabled);
  }

  private getValueAccessor(): ControlValueAccessor | null {
    return (this.formFieldControl()?.ngControl as NgControl)?.valueAccessor;
  }
}
