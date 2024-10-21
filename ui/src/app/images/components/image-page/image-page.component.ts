import { Component } from '@angular/core';
import { ImagesService } from '@app/images/services/images.service';
import { ImageDetailsComponent } from '@app/shared/components/image-details/image-details.component';

@Component({
  selector: 'ogm-image-page',
  standalone: true,
  imports: [ImageDetailsComponent],
  templateUrl: './image-page.component.html',
  styleUrl: './image-page.component.scss',
})
export class ImagePageComponent {
  imageIdParam = ImagesService.IMAGE_ID_PARAM;

  constructor(public readonly imagesService: ImagesService) {}
}
