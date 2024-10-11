import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageResponse } from '@app/gen/ogm-backend';

@Component({
  selector: 'ogm-image-thumbnail',
  standalone: true,
  imports: [],
  templateUrl: './image-thumbnail.component.html',
  styleUrl: './image-thumbnail.component.scss',
})
export class ImageThumbnailComponent {
  @Input({ required: true })
  image: ImageResponse;

  @Output()
  loaded = new EventEmitter<number>();

  onLoad(): void {
    this.loaded.emit(this.image.id);
  }
}
