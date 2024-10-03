import { FormControl } from '@angular/forms';
import { GalleryMetadataType } from '@app/gen/ogm-backend';

export interface GalleryMetadataForm {
  metadataName: FormControl<string>;
  metadataType: FormControl<GalleryMetadataType>;
}
