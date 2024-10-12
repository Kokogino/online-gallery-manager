import { Component, OnDestroy, OnInit } from '@angular/core';
import { GalleryTagsAndMetadataComponent } from '@app/galleries/components/gallery-tags-and-metadata/gallery-tags-and-metadata.component';
import { MatDivider } from '@angular/material/divider';
import { FilterQueryInputComponent } from '@app/shared/components/filter-query-input/filter-query-input.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { GalleryFilterForm } from '@app/galleries/model/gallery-filter-form';
import { GalleriesService } from '@app/galleries/services/galleries.service';
import { AsyncPipe } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ImageListComponent } from '@app/shared/components/image-list/image-list.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'ogm-gallery-details',
  standalone: true,
  imports: [
    GalleryTagsAndMetadataComponent,
    MatDivider,
    FilterQueryInputComponent,
    FormsModule,
    MatButton,
    MatCheckbox,
    ReactiveFormsModule,
    AsyncPipe,
    MatProgressBar,
    ImageListComponent,
  ],
  templateUrl: './gallery-details.component.html',
  styleUrl: './gallery-details.component.scss',
})
export class GalleryDetailsComponent implements OnInit, OnDestroy {
  imagesFilterForm: FormGroup<GalleryFilterForm>;

  galleryId$: Observable<number>;

  constructor(public readonly galleriesService: GalleriesService) {}

  ngOnInit(): void {
    this.imagesFilterForm = this.galleriesService.imagesFilterForm;
    this.galleriesService.findImagesOnGalleryChange = true;
    this.galleryId$ = this.galleriesService.selectedGalleryId$;
  }

  ngOnDestroy(): void {
    this.galleriesService.findImagesOnGalleryChange = false;
  }

  findImages(): void {
    this.galleriesService.findImages();
  }
}
