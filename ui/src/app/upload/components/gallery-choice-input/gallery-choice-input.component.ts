import { Component, ViewChild } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { DefaultControlValueAccessor } from '@app/shared/util/default-control-value-accessor.directive';
import { GalleryChoice } from '@app/gen/ogm-backend';

@Component({
  selector: 'ogm-gallery-choice-input',
  standalone: true,
  imports: [MatFormField, MatSelect, MatOption, ReactiveFormsModule],
  templateUrl: './gallery-choice-input.component.html',
  styleUrl: './gallery-choice-input.component.scss',
})
export class GalleryChoiceInputComponent extends DefaultControlValueAccessor<GalleryChoice> {
  @ViewChild(MatSelect)
  formFieldControl: MatSelect;

  choices = Object.values(GalleryChoice);

  getChoiceLabel(choice: GalleryChoice): string {
    switch (choice) {
      case GalleryChoice.NewGallery:
        return 'Create new gallery';
      case GalleryChoice.AddToGallery:
        return 'Add to existing gallery';
      case GalleryChoice.NoGallery:
        return 'Do not add to gallery';
      default:
        throw new Error('Invalid Gallery Choice');
    }
  }
}
