import { Component, Input } from '@angular/core';
import { ImageResponse } from '@app/gen/ogm-backend';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'ogm-image',
  standalone: true,
  imports: [NgOptimizedImage, NgClass, MatProgressSpinner],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
})
export class ImageComponent {
  @Input({ required: true })
  image: ImageResponse;

  fullImageLoaded = false;
}
