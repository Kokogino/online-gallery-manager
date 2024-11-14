import { FormControl } from '@angular/forms';
import { GalleryMetadataType } from '@app/gen/ogm-backend';
import { MetadataValue } from '@app/galleries/model/metadata-value';

export interface GalleryMetadataEntryForm {
  galleryMetadataId: FormControl<number>;
  type: FormControl<GalleryMetadataType>;
  name: FormControl<string>;
  value: FormControl<MetadataValue>;
}
