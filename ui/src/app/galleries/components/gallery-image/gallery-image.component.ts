import { Component } from '@angular/core';
import { GalleriesService } from '@app/galleries/services/galleries.service';
import { ImageDetailsComponent } from '@app/shared/components/image-details/image-details.component';

@Component({
  selector: 'ogm-gallery-image',
  standalone: true,
  imports: [ImageDetailsComponent],
  templateUrl: './gallery-image.component.html',
  styleUrl: './gallery-image.component.scss',
})
export class GalleryImageComponent {
  imageIdParam = GalleriesService.IMAGE_ID_PARAM;

  constructor(public readonly galleriesService: GalleriesService) {}

  fallbackRoute(): string {
    return `/galleries/${this.galleriesService.getSelectedGalleryIdValue()}`;
  }
}
