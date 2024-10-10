import { Component } from '@angular/core';
import { GalleryTagsAndMetadataComponent } from '@app/galleries/components/gallery-tags-and-metadata/gallery-tags-and-metadata.component';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'ogm-gallery-details',
  standalone: true,
  imports: [GalleryTagsAndMetadataComponent, MatDivider],
  templateUrl: './gallery-details.component.html',
  styleUrl: './gallery-details.component.scss',
})
export class GalleryDetailsComponent {}
