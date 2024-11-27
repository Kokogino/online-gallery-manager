import { Component, input, output } from '@angular/core';
import { ImageResponse } from '@app/gen/ogm-backend';
import { some } from 'lodash-es';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ogm-image-thumbnail',
  imports: [NgClass],
  templateUrl: './image-thumbnail.component.html',
  styleUrl: './image-thumbnail.component.scss',
})
export class ImageThumbnailComponent {
  readonly image = input.required<ImageResponse>();

  readonly loaded = output<number>();

  onLoad(): void {
    this.loaded.emit(this.image().id);
  }

  hasTags(): boolean {
    return some(this.image().tags, (tag) => tag.showTag);
  }

  getTags(): string {
    return this.image()
      .tags.filter((tag) => tag.showTag)
      .map((tag) => tag.name)
      .join(', ');
  }
}
