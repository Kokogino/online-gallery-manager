import { Directive, OnInit, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';

@Directive()
export abstract class DefaultControlValueAccessor<T> implements OnInit, ControlValueAccessor {
  control: FormControl<T> | null;

  abstract formFieldControl: MatFormFieldControl<any>;

  constructor(@Self() protected ngControl: NgControl) {
    ngControl.valueAccessor = this;
  }

  ngOnInit(): void {
    this.control = this.ngControl.control as FormControl;
  }

  registerOnChange(fn: any): void {
    this.getValueAccessor()?.registerOnChange(fn);
  }

  registerOnTouched(fn: any): void {
    this.getValueAccessor()?.registerOnTouched(fn);
  }

  writeValue(obj: any): void {
    this.getValueAccessor()?.writeValue(obj);
  }

  setDisabledState(isDisabled: boolean): void {
    this.getValueAccessor()?.setDisabledState?.(isDisabled);
  }

  private getValueAccessor(): ControlValueAccessor | null {
    return (this.formFieldControl?.ngControl as NgControl)?.valueAccessor;
  }
}
