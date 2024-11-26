import { Component, OnInit } from '@angular/core';
import { GalleryResponse } from '@app/gen/ogm-backend';
import { Observable } from 'rxjs';
import { GalleriesService } from '@app/galleries/services/galleries.service';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MediaQueryService } from '@app/shared/services/media-query.service';
import { MatTooltip } from '@angular/material/tooltip';
import { GalleryDetailsSidebarService } from '@app/galleries/services/gallery-details-sidebar.service';

@Component({
  selector: 'ogm-galleries-title',
  imports: [AsyncPipe, MatProgressSpinner, RouterLink, RouterLinkActive, MatIcon, MatIconButton, MatTooltip],
  templateUrl: './galleries-title.component.html',
  styleUrl: './galleries-title.component.scss',
})
export class GalleriesTitleComponent implements OnInit {
  gallery$: Observable<GalleryResponse>;

  loadingGallery$: Observable<boolean>;

  deletingGalleryId$: Observable<number>;

  constructor(
    public readonly mediaQueryService: MediaQueryService,
    private readonly galleriesService: GalleriesService,
    private readonly galleryDetailsSidebarService: GalleryDetailsSidebarService,
  ) {}

  ngOnInit(): void {
    this.gallery$ = this.galleriesService.selectedGallery$;
    this.loadingGallery$ = this.galleriesService.loadingGallery$;
    this.deletingGalleryId$ = this.galleriesService.deletingGalleryId$;
  }

  openDetailsSidebar(): void {
    this.galleryDetailsSidebarService.toggle();
  }
}
