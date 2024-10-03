import { Component } from '@angular/core';
import { TagsListComponent } from '@app/admin/components/tags-list/tags-list.component';
import { GalleryMetadataListComponent } from '@app/admin/components/gallery-metadata-list/gallery-metadata-list.component';

@Component({
  selector: 'ogm-admin',
  standalone: true,
  imports: [TagsListComponent, GalleryMetadataListComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {}
