import { booleanAttribute, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatFormField, MatInput, MatSuffix } from '@angular/material/input';
import { DefaultControlValueAccessor } from '@app/shared/util/default-control-value-accessor.directive';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { distinctUntilChanged, map, Observable, startWith } from 'rxjs';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { MatError, MatLabel } from '@angular/material/form-field';
import { containsStringsIgnoringAccentsAndCase } from '@app/shared/util/string-compare';
import { isNil } from 'lodash-es';
import { ErrorStateMatcher } from '@angular/material/core';
import { AutocompleteErrorStateMatcher } from '@app/shared/model/autocomplete-error-state-matcher';

@Component({
  selector: 'ogm-autocomplete-input',
  standalone: true,
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
  @Input()
  options: T[];

  @Input()
  panelWidth: string;

  @Input()
  labelText: string;

  @Input()
  optionValue = (option: T) => option as unknown as string;

  @Input({ transform: booleanAttribute })
  required: boolean;

  @ViewChild('hiddenInput')
  formFieldControl: MatInput;

  filteredOptions$: Observable<T[]>;

  inputControl: FormControl<string | T>;

  errorStateMatcher: ErrorStateMatcher;

  override ngOnInit(): void {
    super.ngOnInit();

    this.inputControl = new FormControl(this.control.value, this.required ? Validators.required : []);

    this.filteredOptions$ = this.inputControl.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      map((value) => this.filterOptions(value)),
    );

    this.filteredOptions$.subscribe((options) => {
      const value = this.inputControl.value;
      if (options?.length === 1 && Boolean(value)) {
        this.control.setValue(options[0]);
      } else if (typeof value !== 'string') {
        this.control.setValue(value);
      } else {
        this.control.setValue(undefined);
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

  displayValue = (option: T): string => (option ? this.optionValue(option) : '');

  private filterOptions(value: string | T): T[] {
    const filterValue = typeof value === 'string' ? value : this.optionValue(value);
    return this.options?.filter((option) => containsStringsIgnoringAccentsAndCase(this.optionValue(option), filterValue));
  }
}
