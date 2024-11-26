import { booleanAttribute, Component, inject, Injector, input, OnInit, viewChild } from '@angular/core';
import { MatFormField, MatInput, MatSuffix } from '@angular/material/input';
import { DefaultControlValueAccessor } from '@app/shared/util/default-control-value-accessor.directive';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { combineLatest, distinctUntilChanged, map, Observable, startWith } from 'rxjs';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { MatError, MatLabel } from '@angular/material/form-field';
import { containsStringsIgnoringAccentsAndCase } from '@app/shared/util/string-compare';
import { isNil } from 'lodash-es';
import { ErrorStateMatcher } from '@angular/material/core';
import { AutocompleteErrorStateMatcher } from '@app/shared/model/autocomplete-error-state-matcher';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ogm-autocomplete-input',
  imports: [
    MatFormField,
    MatAutocomplete,
    MatOption,
    MatAutocompleteTrigger,
    ReactiveFormsModule,
    MatInput,
    AsyncPipe,
    MatLabel,
    MatError,
    MatSuffix,
  ],
  templateUrl: './autocomplete-input.component.html',
  styleUrl: './autocomplete-input.component.scss',
})
export class AutocompleteInputComponent<T extends { id?: number }> extends DefaultControlValueAccessor<T> implements OnInit {
  readonly options = input<T[]>();

  readonly panelWidth = input<string>();

  readonly labelText = input<string>();

  readonly optionValue = input((option: T) => option as unknown as string);

  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly formFieldControl = viewChild<MatInput>('hiddenInput');

  filteredOptions$: Observable<T[]>;

  inputControl: FormControl<string | T>;

  errorStateMatcher: ErrorStateMatcher;

  private injector = inject(Injector);

  override ngOnInit(): void {
    super.ngOnInit();

    this.inputControl = new FormControl(this.control.value, this.required() ? Validators.required : []);

    this.filteredOptions$ = combineLatest([
      this.inputControl.valueChanges.pipe(startWith(this.inputControl.value), distinctUntilChanged()),
      toObservable(this.options, { injector: this.injector }),
    ]).pipe(map(([value, options]) => this.filterOptions(value, options)));

    this.filteredOptions$.subscribe((options) => {
      const value = this.inputControl.value;
      if (options?.length === 1 && Boolean(value)) {
        this.control.setValue(options[0]);
      } else if (typeof value !== 'string' && !isNil(value)) {
        this.control.setValue(value);
      } else {
        this.control.setValue(undefined);
      }
    });

    this.control.valueChanges.subscribe((value) => {
      if (value === null) {
        this.inputControl.reset('');
      }
    });

    this.errorStateMatcher = new AutocompleteErrorStateMatcher(this.control);
  }

  updateValue(): void {
    const value = this.control.value;
    if (!isNil(value)) {
      this.inputControl.setValue(value);
    }
  }

  displayValue = (option: T): string => (option ? this.optionValue()(option) : '');

  private filterOptions(value: string | T, options: T[]): T[] {
    const filterValue = typeof value === 'string' ? value : value ? this.optionValue()(value) : '';
    return options?.filter((option) => containsStringsIgnoringAccentsAndCase(this.optionValue()(option), filterValue));
  }
}
