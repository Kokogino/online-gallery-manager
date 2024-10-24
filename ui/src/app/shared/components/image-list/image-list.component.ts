import { AfterViewInit, Component, computed, ElementRef, Input, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ImageLoaderService } from '@app/shared/util/image-loader-service';
import { Observable, Subscription } from 'rxjs';
import { ImageResponse, TagResponse, TagService } from '@app/gen/ogm-backend';
import { AsyncPipe, NgClass } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NoDataMessageComponent } from '@app/shared/components/no-data-message/no-data-message.component';
import { random } from 'lodash-es';
import { ImageThumbnailComponent } from '@app/shared/components/image-thumbnail/image-thumbnail.component';
import { RouterLink } from '@angular/router';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddTagsForm } from '@app/shared/model/add-tags-form';
import { AutocompleteChipListInputComponent } from '@app/shared/components/autocomplete-chip-list-input/autocomplete-chip-list-input.component';
import { MatButton, MatFabButton } from '@angular/material/button';
import { CdkObserveContent } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { MatIcon } from '@angular/material/icon';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';

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
    CdkObserveContent,
    MatFabButton,
    MatIcon,
    MatSlider,
    FormsModule,
    MatSliderThumb,
  ],
  templateUrl: './image-list.component.html',
  styleUrl: './image-list.component.scss',
})
export class ImageListComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true })
  imageLoaderService: ImageLoaderService;

  @Input({ required: true })
  imageDetailsBaseRoute: string;

  @ViewChild('imageList')
  imageList: ElementRef<HTMLDivElement>;

  images$: Observable<ImageResponse[]>;

  loading$: Observable<boolean>;

  numberOfColumns = signal<number>(0);
  columns = computed<number[]>(() => [...Array(this.numberOfColumns())].map(() => random(true)));

  allTags: TagResponse[];

  selectedImageIds: number[] = [];

  addTagsForm: FormGroup<AddTagsForm>;

  onlyShowSelected = new FormControl<boolean>(false);

  isScrollingPaused = true;
  scrollSpeed = 0.5;

  private resizeSubscription: Subscription;
  private imagesSubscription: Subscription;

  private accumulatedScroll = 0;
  private lastScrollStepTime: number;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly tagService: TagService,
    private readonly sharedResizeObserver: SharedResizeObserver,
  ) {}

  ngOnInit(): void {
    this.images$ = this.imageLoaderService.images$;
    this.loading$ = this.imageLoaderService.loadingImages$;

    this.tagService.getAllTags().subscribe((tags) => (this.allTags = tags));

    this.imagesSubscription = this.images$.subscribe(
      (images) => (this.selectedImageIds = this.selectedImageIds.filter((id) => images?.findIndex((image) => image.id === id) >= 0)),
    );

    this.addTagsForm = this.formBuilder.group({
      tags: [[] as TagResponse[], Validators.required],
    });
  }

  ngAfterViewInit(): void {
    this.resizeSubscription = this.sharedResizeObserver
      .observe(this.imageList.nativeElement)
      .subscribe((entries) =>
        this.numberOfColumns.set(Math.min(Math.floor(entries[0].contentRect.width / 250) || 1, ImageLoaderService.BATCH_SIZE)),
      );
  }

  ngOnDestroy(): void {
    this.isScrollingPaused = true;
    this.resizeSubscription?.unsubscribe();
    this.imagesSubscription?.unsubscribe();
  }

  loaded(index: number, imageCount: number): void {
    if (index >= Math.max(imageCount - this.numberOfColumns(), 0)) {
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
        .subscribe(() => this.addTagsForm.reset());
    }
  }

  shouldHide(image: ImageResponse): boolean {
    return this.selectedImageIds.length > 0 && this.onlyShowSelected.value && !this.isImageSelected(image);
  }

  deselectAll(): void {
    this.selectedImageIds = [];
    this.onlyShowSelected.setValue(false);
  }

  toggleAutoScroll(): void {
    if (this.isScrollingPaused) {
      this.startAutoScroll();
    } else {
      this.isScrollingPaused = true;
    }
  }

  getTagName = (tag: TagResponse): string => tag.name;

  private startAutoScroll(): void {
    this.lastScrollStepTime = Date.now();
    this.accumulatedScroll = 0;
    this.isScrollingPaused = false;
    this.autoScroll();
  }

  private autoScroll(): void {
    const imagesList = this.imageList.nativeElement;

    if (imagesList.clientHeight > 0) {
      const timePassed = (Date.now() - this.lastScrollStepTime) / 1000;
      const tickDistance = this.scrollSpeed * 200 + 50;
      this.accumulatedScroll += timePassed * tickDistance;
      if (this.accumulatedScroll > 1) {
        const scrollDistance = Math.floor(this.accumulatedScroll);
        imagesList.scrollBy(0, scrollDistance);
        this.accumulatedScroll -= scrollDistance;
      }

      if (imagesList.scrollTop + imagesList.clientHeight === imagesList.scrollHeight) {
        this.isScrollingPaused = true;
      }
    }

    if (!this.isScrollingPaused) {
      this.lastScrollStepTime = Date.now();
      requestAnimationFrame(this.autoScroll.bind(this));
    }
  }
}
