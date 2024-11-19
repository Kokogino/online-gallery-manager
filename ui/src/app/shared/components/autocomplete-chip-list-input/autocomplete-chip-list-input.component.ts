import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DefaultControlValueAccessor } from '@app/shared/util/default-control-value-accessor.directive';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatChipGrid, MatChipInput, MatChipRemove, MatChipRow } from '@angular/material/chips';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { combineLatest, map, Observable, startWith } from 'rxjs';
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
  options: T[];

  @Input()
  labelText: string;

  @Input()
  optionValue = (option: T): string => option as unknown as string;

  @ViewChild(MatChipGrid)
  formFieldControl: MatChipGrid;

  @ViewChild('autoTrigger')
  autoTrigger: MatAutocompleteTrigger;

  @ViewChild('input')
  input: MatChipInput;

  selectedOption: T;

  separatorKeysCodes = [ENTER];

  filteredOptions$: Observable<T[]>;

  inputControl = new FormControl<string | T>('');

  override ngOnInit(): void {
    super.ngOnInit();

    this.filteredOptions$ = combineLatest([
      this.inputControl.valueChanges.pipe(startWith('')),
      this.control.valueChanges.pipe(startWith(this.control.value)),
    ]).pipe(map(([value, addedValues]) => this.filterOptions(value, addedValues)));

    this.filteredOptions$.subscribe((options) => {
      const value = this.inputControl.value;
      if (options?.length === 1 && Boolean(value)) {
        this.selectedOption = options[0];
      } else if (typeof value !== 'string') {
        this.selectedOption = value;
      } else {
        this.selectedOption = undefined;
      }
    });
  }

  optionSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedOption = event.option.value;
    this.addChip();
  }

  removeChip(value: T): void {
    const index = this.control.value.findIndex((option) => option.id === value.id);

    if (index >= 0) {
      this.control.value.splice(index, 1);
      this.control.updateValueAndValidity();
    }
  }

  addChip(): void {
    if (this.selectedOption !== undefined) {
      const index = this.control.value?.findIndex((option) => option.id === this.selectedOption.id);

      if (index === undefined || index === -1) {
        this.control.setValue([...(this.control.value || []), this.selectedOption]);
        this.control.updateValueAndValidity();
        this.selectedOption = undefined;
      }

      this.input.clear();
      this.inputControl.reset('');
      this.autoTrigger.closePanel();
    }
  }

  displayValue = (option: T): string => (option ? this.optionValue(option) : '');

  private filterOptions(value: string | T, addedValues: T[]): T[] {
    const filterValue = typeof value === 'string' ? value : this.optionValue(value);
    return this.options.filter(
      (option) =>
        containsStringsIgnoringAccentsAndCase(this.optionValue(option), filterValue) &&
        !addedValues?.find((selectedOption) => selectedOption.id === option.id),
    );
  }
}
