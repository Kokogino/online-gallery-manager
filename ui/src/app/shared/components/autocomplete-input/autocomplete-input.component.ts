import { booleanAttribute, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatFormField, MatInput, MatPrefix, MatSuffix } from '@angular/material/input';
import { DefaultControlValueAccessor } from '@app/shared/util/default-control-value-accessor.directive';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { map, Observable, startWith, tap } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, NgClass } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatError, MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'ogm-autocomplete-input',
  standalone: true,
  imports: [
    MatFormField,
    MatIcon,
    MatAutocomplete,
    MatOption,
    MatAutocompleteTrigger,
    ReactiveFormsModule,
    MatInput,
    AsyncPipe,
    MatIconButton,
    MatLabel,
    MatError,
    MatPrefix,
    MatSuffix,
    NgClass,
  ],
  templateUrl: './autocomplete-input.component.html',
  styleUrl: './autocomplete-input.component.scss',
})
export class AutocompleteInputComponent<T extends { id: number }> extends DefaultControlValueAccessor<string> implements OnInit {
  @Input()
  optionDisplayValue: (option: T) => string;

  @Input()
  options: T[];

  @Input()
  panelWidth: string;

  @Input()
  selectedOption: T;

  @Output()
  selectedOptionChange: EventEmitter<T> = new EventEmitter<T>();

  @Output()
  optionSelected: EventEmitter<T> = new EventEmitter<T>();

  @Input({ transform: booleanAttribute })
  isSearchInput = false;

  @Input()
  labelText: string;

  @Input()
  optionValue = (option: T): string => option as unknown as string;

  @ViewChild('autoTrigger')
  autoTrigger: MatAutocompleteTrigger;

  @ViewChild(MatInput)
  formFieldControl: MatInput;

  filteredOptions$: Observable<T[]>;

  override ngOnInit(): void {
    super.ngOnInit();
    this.control.valueChanges.subscribe((value) =>
      this.selectedOptionChange.emit(this.options?.find((option) => this.optionValue(option).toLowerCase() === value?.toLowerCase())),
    );

    this.filteredOptions$ = this.control.valueChanges.pipe(
      startWith(''),
      map((value): [string, T[]] => [value, this.filterOptions(value)]),
      tap(([value, options]: [string, T[]]) => {
        if (options?.length === 1 && value?.length > 0) {
          this.selectedOptionChange.emit(options[0]);
        }
      }),
      map(([_, options]) => options),
    );

    this.optionDisplayValue = this.optionDisplayValue ?? this.optionValue;
  }

  clearSearch(): void {
    this.control.reset();
    requestAnimationFrame(() => this.autoTrigger.openPanel());
  }

  selectOption(option: T): void {
    this.selectedOptionChange.emit(option);
    this.optionSelected.emit(option);
  }

  private filterOptions(value: string): T[] {
    const filterValue = value?.toLowerCase() || '';
    return this.options.filter((option) => this.optionDisplayValue(option).toLowerCase().includes(filterValue));
  }
}
