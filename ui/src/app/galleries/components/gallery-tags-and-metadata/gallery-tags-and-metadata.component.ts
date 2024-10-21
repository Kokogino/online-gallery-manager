import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  GalleryMetadataResponse,
  GalleryMetadataService,
  GalleryMetadataType,
  GalleryResponse,
  TagResponse,
  TagService,
  UpdateGalleryDto,
} from '@app/gen/ogm-backend';
import { BehaviorSubject, combineLatest, debounceTime, filter, finalize, Observable, Subscription } from 'rxjs';
import { MatChip, MatChipListbox, MatChipOption, MatChipSet, MatChipTrailingIcon } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { NoDataMessageComponent } from '@app/shared/components/no-data-message/no-data-message.component';
import { MatProgressBar } from '@angular/material/progress-bar';
import { GalleriesService } from '@app/galleries/services/galleries.service';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GalleryDetailsForm } from '@app/galleries/model/gallery-details-form';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput, MatSuffix } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import moment from 'moment';
import { isNil } from 'lodash-es';

@Component({
  selector: 'ogm-gallery-tags-and-metadata',
  standalone: true,
  imports: [
    MatChipSet,
    MatChip,
    MatChipTrailingIcon,
    MatIcon,
    NoDataMessageComponent,
    MatProgressBar,
    AsyncPipe,
    MatChipListbox,
    MatChipOption,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatSuffix,
  ],
  templateUrl: './gallery-tags-and-metadata.component.html',
  styleUrl: './gallery-tags-and-metadata.component.scss',
})
export class GalleryTagsAndMetadataComponent implements OnInit, OnDestroy {
  gallery$: Observable<GalleryResponse>;

  allTags: TagResponse[];
  allGalleryMetadata = new BehaviorSubject<GalleryMetadataResponse[]>(undefined);

  galleryDetailsForm: FormGroup<GalleryDetailsForm>;

  loadingAllGalleryMetadata = true;
  loadingAllTags = true;
  loadingGallery$: Observable<boolean>;

  gallerySubscription: Subscription;
  formSubscription: Subscription;

  GalleryMetadataType = GalleryMetadataType;

  constructor(
    private readonly tagService: TagService,
    private readonly galleriesService: GalleriesService,
    private readonly formBuilder: FormBuilder,
    private readonly galleryMetadataService: GalleryMetadataService,
  ) {}

  ngOnInit(): void {
    this.gallery$ = this.galleriesService.selectedGallery$;
    this.loadingGallery$ = this.galleriesService.loadingGallery$;
    this.tagService
      .getAllTags()
      .pipe(finalize(() => (this.loadingAllTags = false)))
      .subscribe((tags) => (this.allTags = tags));
    this.galleryMetadataService
      .getAllGalleryMetadata()
      .pipe(finalize(() => (this.loadingAllGalleryMetadata = false)))
      .subscribe((metadata) => this.allGalleryMetadata.next(metadata));

    this.gallerySubscription = combineLatest([this.gallery$, this.allGalleryMetadata])
      .pipe(filter(([gallery, galleryMetadata]) => Boolean(gallery) && Boolean(galleryMetadata)))
      .subscribe(([gallery, galleryMetadata]) => this.setupDetailsForm(gallery, galleryMetadata));
  }

  ngOnDestroy(): void {
    this.gallerySubscription?.unsubscribe();
    this.formSubscription?.unsubscribe();
  }

  private setupDetailsForm(gallery: GalleryResponse, galleryMetadata: GalleryMetadataResponse[]): void {
    this.galleryDetailsForm = this.formBuilder.group({
      name: [gallery.name],
      tagIds: [gallery.tags.map((tag) => tag.tagId)],
      metadata: this.formBuilder.array(
        galleryMetadata.map((metadata) => {
          const entry = gallery.metadata.find((entry) => entry.galleryMetadataId === metadata.id);
          let value: any = entry?.value;
          if (value !== undefined) {
            switch (metadata.type) {
              case GalleryMetadataType.Date:
                value = moment(value);
                break;
              case GalleryMetadataType.Integer:
                value = parseInt(value);
                break;
              case GalleryMetadataType.Double:
                value = parseFloat(value);
                break;
            }
          }
          return this.formBuilder.group({
            galleryMetadataId: [metadata.id],
            type: [metadata.type],
            name: [metadata.name],
            value: [value],
          });
        }),
      ),
    });

    this.formSubscription?.unsubscribe();
    this.formSubscription = this.galleryDetailsForm.valueChanges.pipe(debounceTime(500)).subscribe((formValues) => {
      const updateGalleryDto: UpdateGalleryDto = {
        name: formValues.name,
        tagIds: formValues.tagIds,
        galleryMetadata: formValues.metadata
          .filter((metadata) => !isNil(metadata.value))
          .map((metadata) => ({
            galleryMetadataId: metadata.galleryMetadataId,
            value: metadata.type === GalleryMetadataType.Date ? moment(metadata.value).toISOString() : String(metadata.value),
          })),
      };
      this.galleriesService.updateGalleryDetails(updateGalleryDto);
    });
  }
}
