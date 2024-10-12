import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ImageLoaderService } from '@app/shared/util/image-loader-service';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { ImageResponse, TagResponse, TagService } from '@app/gen/ogm-backend';
import { AsyncPipe, NgClass } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NoDataMessageComponent } from '@app/shared/components/no-data-message/no-data-message.component';
import { MediaQueryService } from '@app/core/services/media-query.service';
import { random } from 'lodash-es';
import { ImageThumbnailComponent } from '@app/shared/components/image-thumbnail/image-thumbnail.component';
import { RouterLink } from '@angular/router';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddTagsForm } from '@app/shared/model/add-tags-form';
import { AutocompleteChipListInputComponent } from '@app/shared/components/autocomplete-chip-list-input/autocomplete-chip-list-input.component';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'ogm-image-list',
  standalone: true,
  imports: [
    AsyncPipe,
    MatProgressBar,
    NoDataMessageComponent,
    ImageThumbnailComponent,
    RouterLink,
    MatCheckbox,
    ReactiveFormsModule,
    AutocompleteChipListInputComponent,
    MatButton,
    NgClass,
  ],
  templateUrl: './image-list.component.html',
  styleUrl: './image-list.component.scss',
})
export class ImageListComponent implements OnInit, OnDestroy {
  @Input({ required: true })
  imageLoaderService: ImageLoaderService;

  @Input({ required: true })
  imageDetailsBaseRoute: string;

  images$: Observable<ImageResponse[]>;

  loading$: Observable<boolean>;

  columns: number[] = [];

  allTags: TagResponse[];

  selectedImageIds: number[] = [];

  addTagsForm: FormGroup<AddTagsForm>;

  onlyShowSelected = new FormControl<boolean>(false);

  private columnSubscription: Subscription;
  private imagesSubscription: Subscription;

  constructor(
    private readonly mediaQueryService: MediaQueryService,
    private readonly formBuilder: FormBuilder,
    private readonly tagService: TagService,
  ) {}

  ngOnInit(): void {
    this.images$ = this.imageLoaderService.images$;
    this.loading$ = this.imageLoaderService.loadingImages$;

    this.tagService.getAllTags().subscribe((tags) => (this.allTags = tags));

    this.columnSubscription = combineLatest([
      this.mediaQueryService.isMaximumMobileLayout$,
      this.mediaQueryService.isMaximumTabletLayout$,
      this.mediaQueryService.isMaximumDesktopLayout$,
    ]).subscribe(([biggerThanMobile, biggerThanTablet, biggerThanDesktop]) => {
      const numberOfColumns = 1 + (!biggerThanMobile ? 1 : 0) + (!biggerThanTablet ? 2 : 0) + (!biggerThanDesktop ? 2 : 0);
      this.columns = [...Array(numberOfColumns)].map(() => random(true));
    });

    this.imagesSubscription = this.images$.subscribe(
      (images) => (this.selectedImageIds = this.selectedImageIds.filter((id) => images?.findIndex((image) => image.id === id) >= 0)),
    );

    this.addTagsForm = this.formBuilder.group({
      tags: [[] as TagResponse[], Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.columnSubscription?.unsubscribe();
    this.imagesSubscription?.unsubscribe();
  }

  loaded(index: number, imageCount: number): void {
    if (index >= Math.max(imageCount - this.columns.length, 0)) {
      this.imageLoaderService.loadMoreImages();
    }
  }

  toggleSelection(event: MatCheckboxChange, image: ImageResponse): void {
    if (event.checked) {
      this.selectedImageIds.push(image.id);
    } else {
      const index = this.selectedImageIds.findIndex((id) => id === image.id);
      this.selectedImageIds.splice(index, 1);
      if (this.selectedImageIds.length === 0) {
        this.onlyShowSelected.setValue(false);
      }
    }
  }

  isImageSelected(image: ImageResponse): boolean {
    return this.selectedImageIds.findIndex((id) => id === image.id) >= 0;
  }

  addTags(): void {
    if (this.addTagsForm.valid && this.selectedImageIds.length > 0) {
      this.imageLoaderService
        .addTagsToImages(
          this.addTagsForm.getRawValue().tags.map((tag) => tag.id),
          this.selectedImageIds,
        )
        .subscribe(() => {
          this.addTagsForm.reset();
        });
    }
  }

  shouldHide(image: ImageResponse): boolean {
    return this.selectedImageIds.length > 0 && this.onlyShowSelected.value && !this.isImageSelected(image);
  }

  deselectAll(): void {
    this.selectedImageIds = [];
    this.onlyShowSelected.setValue(false);
  }

  getTagName = (tag: TagResponse): string => tag.name;
}
