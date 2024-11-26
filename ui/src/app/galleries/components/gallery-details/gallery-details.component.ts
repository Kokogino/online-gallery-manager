import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GalleryTagsAndMetadataComponent } from '@app/galleries/components/gallery-tags-and-metadata/gallery-tags-and-metadata.component';
import { MatDivider } from '@angular/material/divider';
import { FilterQueryInputComponent } from '@app/shared/components/filter-query-input/filter-query-input.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { GalleryFilterForm } from '@app/galleries/model/gallery-filter-form';
import { GalleriesService } from '@app/galleries/services/galleries.service';
import { AsyncPipe } from '@angular/common';
import { ImageListComponent } from '@app/shared/components/image-list/image-list.component';
import { Observable } from 'rxjs';
import { MediaQueryService } from '@app/shared/services/media-query.service';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { GalleryDetailsSidebarService } from '@app/galleries/services/gallery-details-sidebar.service';
import { DeletingOverlayComponent } from '@app/shared/components/deleting-overlay/deleting-overlay.component';

@Component({
  selector: 'ogm-gallery-details',
  imports: [
    GalleryTagsAndMetadataComponent,
    MatDivider,
    FilterQueryInputComponent,
    FormsModule,
    MatButton,
    MatCheckbox,
    ReactiveFormsModule,
    AsyncPipe,
    ImageListComponent,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    DeletingOverlayComponent,
  ],
  templateUrl: './gallery-details.component.html',
  styleUrl: './gallery-details.component.scss',
})
export class GalleryDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('detailsSidebar')
  detailsSidebar: MatSidenav;

  imagesFilterForm: FormGroup<GalleryFilterForm>;

  galleryId$: Observable<number>;

  deletingGalleryId$: Observable<number>;

  constructor(
    public readonly mediaQueryService: MediaQueryService,
    public readonly galleriesService: GalleriesService,
    private readonly galleryDetailsSidebarService: GalleryDetailsSidebarService,
  ) {}

  ngOnInit(): void {
    this.imagesFilterForm = this.galleriesService.imagesFilterForm;
    this.galleriesService.findImagesOnGalleryChange = true;
    this.galleryId$ = this.galleriesService.selectedGalleryId$;
    this.deletingGalleryId$ = this.galleriesService.deletingGalleryId$;
  }

  ngAfterViewInit(): void {
    this.galleryDetailsSidebarService.detailsSidebar = this.detailsSidebar;
  }

  ngOnDestroy(): void {
    this.galleriesService.findImagesOnGalleryChange = false;
    this.galleryDetailsSidebarService.destroy();
  }

  findImages(): void {
    this.galleriesService.findImages();
  }
}
