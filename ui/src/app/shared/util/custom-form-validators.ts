import { AbstractControl, AsyncValidatorFn, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { filter } from 'lodash-es';
import { first, map } from 'rxjs/operators';
import { MatInput } from '@angular/material/input';
import { compareStringsIgnoringAccentsAndCase } from '@app/shared/util/string-compare';

export class CustomFormValidators {
  private static _initialize = ((): boolean => {
    Object.defineProperty(MatInput.prototype, 'required', {
      get() {
        return (
          this._required ??
          (this.ngControl?.control?.hasValidator(Validators.required) ||
            this.ngControl?.control?.hasValidator(CustomFormValidators.trimmedRequired)) ??
          false
        );
      },
    });

    return true;
  })();

  public static trimmedRequired(control: AbstractControl): ValidationErrors | null {
    const newControl = new FormControl();
    let value = control.value;
    if (typeof value === 'string') {
      value = value.trim();
    }
    newControl.setValue(value);
    return Validators.required(newControl) ? { trimmedRequired: true } : null;
  }

  public static asyncMaxNTimesIn(n: number, array$: Observable<Array<string>>): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> =>
      array$.pipe(
        map((array) => {
          const count = filter(array, (arrayValue) => compareStringsIgnoringAccentsAndCase(control.value.trim(), arrayValue) === 0).length;
          return count > n ? { asyncMaxNTimesIn: count } : null;
        }),
        first(),
      );
  }

  public static maxNTimesIn(n: number, array: Array<string>): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const count = filter(array, (arrayValue) => compareStringsIgnoringAccentsAndCase(control.value.trim(), arrayValue) === 0).length;
      return count > n ? { maxNTimesIn: count } : null;
    };
  }
}
