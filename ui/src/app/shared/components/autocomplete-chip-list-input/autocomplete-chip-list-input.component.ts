import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DefaultControlValueAccessor } from '@app/shared/util/default-control-value-accessor.directive';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatChipGrid, MatChipInput, MatChipInputEvent, MatChipRemove, MatChipRow } from '@angular/material/chips';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { combineLatest, map, Observable, startWith, tap } from 'rxjs';
import { ENTER } from '@angular/cdk/keycodes';
import { MatIcon } from '@angular/material/icon';
import { containsStringsIgnoringAccentsAndCase } from '@app/shared/util/string-compare';

@Component({
  selector: 'ogm-autocomplete-chip-list-input',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatChipGrid,
    ReactiveFormsModule,
    MatChipRow,
    MatChipRemove,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatInput,
    MatChipInput,
    MatOption,
    AsyncPipe,
    MatHint,
    MatIcon,
  ],
  templateUrl: './autocomplete-chip-list-input.component.html',
  styleUrl: './autocomplete-chip-list-input.component.scss',
})
export class AutocompleteChipListInputComponent<T extends { id?: number }> extends DefaultControlValueAccessor<T[]> implements OnInit {
  @Input()
  optionDisplayValue: (option: T) => string;

  @Input()
  options: T[];

  @Input()
  labelText: string;

  @ViewChild(MatChipGrid)
  formFieldControl: MatChipGrid;

  @ViewChild('autoTrigger')
  autoTrigger: MatAutocompleteTrigger;

  @ViewChild('input')
  input: ElementRef<HTMLInputElement>;

  selectedOption: T;

  separatorKeysCodes = [ENTER];

  filteredOptions$: Observable<T[]>;

  inputControl = new FormControl<string>(undefined);

  @Input()
  optionValue = (option: T): string => option as unknown as string;

  override ngOnInit(): void {
    super.ngOnInit();

    this.filteredOptions$ = combineLatest([
      this.inputControl.valueChanges.pipe(startWith('')),
      this.control.valueChanges.pipe(startWith(this.control.value)),
    ]).pipe(
      map(([value, addedValues]): [string, T[]] => [value, this.filterOptions(value, addedValues)]),
      tap(([value, options]: [string, T[]]) => {
        if (options?.length === 1 && value?.length > 0) {
          this.selectedOption = options[0];
        } else {
          this.selectedOption = undefined;
        }
      }),
      map(([_, options]) => options),
    );

    this.optionDisplayValue = this.optionDisplayValue ?? this.optionValue;
  }

  optionSelected(option: T): void {
    this.selectedOption = option;
    this.addChip();
  }

  removeChip(value: T): void {
    const index = this.control.value.findIndex((option) => option.id === value.id);

    if (index >= 0) {
      this.control.value.splice(index, 1);
      this.control.updateValueAndValidity();
    }
  }

  addChip(event?: MatChipInputEvent): void {
    if (this.selectedOption !== undefined) {
      const index = this.control.value?.findIndex((option) => option.id === this.selectedOption.id);

      if (index === undefined || index === -1) {
        this.control.setValue([...(this.control.value || []), this.selectedOption]);
        this.control.updateValueAndValidity();
        this.selectedOption = undefined;
      }

      this.input.nativeElement.value = '';
      this.inputControl.reset();
      event?.chipInput?.clear();
    }
    this.autoTrigger.openPanel();
  }

  private filterOptions(value: string, addedValues: T[]): T[] {
    return this.options.filter(
      (option) =>
        containsStringsIgnoringAccentsAndCase(this.optionDisplayValue(option), value) &&
        !addedValues?.find((selectedOption) => selectedOption.id === option.id),
    );
  }
}
