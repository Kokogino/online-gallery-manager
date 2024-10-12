import { FormControl } from '@angular/forms';

export interface ImageForm {
  galleryId: FormControl<number>;
  tagIds: FormControl<number[]>;
}
