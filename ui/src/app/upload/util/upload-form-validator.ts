import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { GalleryChoice } from '@app/gen/ogm-backend';
import { CustomFormValidators } from '@app/shared/util/custom-form-validators';

export const uploadFormValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const galleryChoice = control.get('galleryChoice');
  const newGalleryName = control.get('newGalleryName');
  const gallery = control.get('gallery');
  switch (galleryChoice.value as GalleryChoice) {
    case 'ADD_TO_GALLERY':
      gallery.setErrors(Validators.required(gallery));
      newGalleryName.setErrors(null);
      break;
    case 'NEW_GALLERY':
      newGalleryName.setErrors(CustomFormValidators.trimmedRequired(newGalleryName));
      gallery.setErrors(null);
      break;
    default:
      newGalleryName.setErrors(null);
      gallery.setErrors(null);
  }
  return null;
};
