import { FormControl } from '@angular/forms';
import { GalleryMetadataType } from '@app/gen/ogm-backend';

export interface GalleryMetadataEntryForm {
  galleryMetadataId: FormControl<number>;
  type: FormControl<GalleryMetadataType>;
  name: FormControl<string>;
  value: FormControl<any>;
}
