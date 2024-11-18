import { ErrorStateMatcher } from '@angular/material/core';
import { AbstractControl, FormControl, FormGroupDirective, NgForm } from '@angular/forms';

export class AutocompleteErrorStateMatcher extends ErrorStateMatcher {
  constructor(private readonly parentControl: FormControl) {
    super();
  }

  override isErrorState(control: AbstractControl | null, _: FormGroupDirective | NgForm | null): boolean {
    return control.touched && (!this.parentControl.valid || !control.valid);
  }
}
