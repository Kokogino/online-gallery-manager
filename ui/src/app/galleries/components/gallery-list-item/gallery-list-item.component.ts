import { Component, input } from '@angular/core';
import { GalleryMetadataType, GalleryResponse } from '@app/gen/ogm-backend';
import { DatePipe } from '@angular/common';
import { MatChip } from '@angular/material/chips';
import { MatRipple } from '@angular/material/core';

@Component({
  selector: 'ogm-gallery-list-item',
  imports: [DatePipe, MatChip, MatRipple],
  templateUrl: './gallery-list-item.component.html',
  styleUrl: './gallery-list-item.component.scss',
})
export class GalleryListItemComponent {
  readonly gallery = input.required<GalleryResponse>();

  GalleryMetadataType = GalleryMetadataType;
}
