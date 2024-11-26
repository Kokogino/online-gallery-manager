import { Component, OnInit, viewChild } from '@angular/core';
import { DefaultControlValueAccessor } from '@app/shared/util/default-control-value-accessor.directive';
import { MatFormField, MatInput, MatPrefix, MatSuffix } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatError, MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'ogm-search-input',
  imports: [MatFormField, MatIcon, ReactiveFormsModule, MatInput, MatIconButton, MatLabel, MatError, MatPrefix, MatSuffix],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
})
export class SearchInputComponent extends DefaultControlValueAccessor<string> implements OnInit {
  readonly formFieldControl = viewChild(MatInput);

  clearSearch(): void {
    this.control.reset();
  }
}
