import { Component, input } from '@angular/core';
import { ImageResponse } from '@app/gen/ogm-backend';
import { NgClass } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'ogm-image',
  imports: [NgClass, MatProgressSpinner],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
})
export class ImageComponent {
  readonly image = input.required<ImageResponse>();

  fullImageLoaded = false;
}
