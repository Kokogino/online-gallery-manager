import { FormControl } from '@angular/forms';
import { GalleryChoice, GalleryResponse, ImageHost } from '@app/gen/ogm-backend';

export interface UploadForm {
  host: FormControl<ImageHost>;
  galleryChoice: FormControl<GalleryChoice>;
  newGalleryName: FormControl<string>;
  gallery: FormControl<GalleryResponse>;
  editUrl: FormControl<string>;
  bbCode: FormControl<string>;
}
