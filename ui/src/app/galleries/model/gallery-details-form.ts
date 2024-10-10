import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { GalleryMetadataEntryForm } from '@app/galleries/model/gallery-metadata-entry-form';

export interface GalleryDetailsForm {
  name: FormControl<string>;
  tagIds: FormControl<number[]>;
  metadata: FormArray<FormGroup<GalleryMetadataEntryForm>>;
}
