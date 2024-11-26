import { AfterViewInit, Component, computed, ElementRef, Input, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ImageLoaderService } from '@app/shared/util/image-loader-service';
import { BehaviorSubject, combineLatest, map, Observable, startWith, Subscription } from 'rxjs';
import { ImageResponse, TagResponse, TagService } from '@app/gen/ogm-backend';
import { AsyncPipe, NgClass } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NoDataMessageComponent } from '@app/shared/components/no-data-message/no-data-message.component';
import { random } from 'lodash-es';
import { ImageThumbnailComponent } from '@app/shared/components/image-thumbnail/image-thumbnail.component';
import { RouterLink } from '@angular/router';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddTagsForm } from '@app/shared/model/add-tags-form';
import { AutocompleteChipListInputComponent } from '@app/shared/components/autocomplete-chip-list-input/autocomplete-chip-list-input.component';
import { MatButton, MatFabButton } from '@angular/material/button';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { MatIcon } from '@angular/material/icon';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { FlexResizerDirective } from '@app/shared/util/flex-resizer.directive';
import { FlexResizableDirective } from '@app/shared/util/flex-resizable.directive';
import { SettingsService } from '@app/shared/services/settings.service';

@Component({
  selector: 'ogm-image-list',
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
    MatFabButton,
    MatIcon,
    MatSlider,
    FormsModule,
    MatSliderThumb,
    FlexResizerDirective,
    FlexResizableDirective,
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

  @ViewChild('tagsForm')
  tagsForm: FormGroupDirective;

  loading$: Observable<boolean>;

  numberOfColumns = computed<number>(() =>
    Math.min(Math.floor(this.imagesListWidth() / this.columnWidth()) || 1, ImageLoaderService.BATCH_SIZE),
  );
  columns = computed<number[]>(() => [...Array(this.numberOfColumns())].map(() => random(true)));

  allTags: TagResponse[];

  selectedImageIdsSubject = new BehaviorSubject<number[]>([]);

  addTagsForm: FormGroup<AddTagsForm>;

  onlyShowSelected = new FormControl<boolean>(false);

  isScrollingPaused = true;
  scrollSpeed = 0.5;

  filteredImagesSubject = new BehaviorSubject<ImageResponse[]>(undefined);

  private imagesListWidth = signal<number>(0);
  private columnWidth = signal<number>(250);

  private images$: Observable<ImageResponse[]>;

  private resizeSubscription: Subscription;
  private imagesSubscription: Subscription;
  private filterSubscription: Subscription;

  private accumulatedScroll = 0;
  private lastScrollStepTime: number;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly tagService: TagService,
    private readonly sharedResizeObserver: SharedResizeObserver,
    private readonly settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.images$ = this.imageLoaderService.images$;
    this.loading$ = this.imageLoaderService.loadingImages$;

    this.tagService.getAllTags().subscribe((tags) => (this.allTags = tags));

    this.imagesSubscription = this.images$.subscribe((images) =>
      this.selectedImageIdsSubject.next(
        this.selectedImageIdsSubject.value.filter((id) => images?.find((image) => image.id === id)?.thumbnailUrl),
      ),
    );

    this.addTagsForm = this.formBuilder.group({
      tags: [[] as TagResponse[], Validators.required],
    });

    this.columnWidth.set(Math.max(50, this.settingsService.getColumnWidth() || 250));

    this.filterImages();
  }

  ngAfterViewInit(): void {
    this.resizeSubscription = this.sharedResizeObserver
      .observe(this.imageList.nativeElement)
      .subscribe((entries) => this.imagesListWidth.set(entries[0].contentRect.width));
  }

  ngOnDestroy(): void {
    this.isScrollingPaused = true;
    this.resizeSubscription?.unsubscribe();
    this.imagesSubscription?.unsubscribe();
    this.filterSubscription?.unsubscribe();
  }

  loaded(index: number, imageCount: number): void {
    if (index >= Math.max(imageCount - this.numberOfColumns(), 0)) {
      this.imageLoaderService.loadMoreImages();
    }
  }

  toggleSelection(event: MatCheckboxChange, image: ImageResponse): void {
    const selectedImageIds = this.selectedImageIdsSubject.value;
    if (event.checked) {
      selectedImageIds.push(image.id);
    } else {
      const index = selectedImageIds.findIndex((id) => id === image.id);
      selectedImageIds.splice(index, 1);
      if (selectedImageIds.length === 0) {
        this.onlyShowSelected.setValue(false);
      }
    }
    this.selectedImageIdsSubject.next(selectedImageIds);
  }

  isImageSelected$(image: ImageResponse): Observable<boolean> {
    return this.selectedImageIdsSubject.pipe(map((selectedImageIds) => selectedImageIds.findIndex((id) => id === image.id) >= 0));
  }

  addTags(): void {
    if (this.addTagsForm.valid && this.selectedImageIdsSubject.value.length > 0) {
      this.imageLoaderService
        .addTagsToImages(
          this.addTagsForm.getRawValue().tags.map((tag) => tag.id),
          this.selectedImageIdsSubject.value,
        )
        .subscribe(() => this.tagsForm.resetForm());
    }
  }

  deselectAll(): void {
    this.selectedImageIdsSubject.next([]);
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

  resizeColumn(amount: number): void {
    this.columnWidth.update((columnWidth) => Math.min(this.imagesListWidth(), Math.max(50, columnWidth + amount)));
    this.settingsService.setColumnWidth(this.columnWidth());
  }

  private filterImages(): void {
    this.filterSubscription = combineLatest([
      this.images$,
      this.onlyShowSelected.valueChanges.pipe(startWith(this.onlyShowSelected.value)),
      this.selectedImageIdsSubject,
    ])
      .pipe(
        map(([images, onlyShowSelected, selectedImageIds]) =>
          images?.filter((image) => (!onlyShowSelected || selectedImageIds.findIndex((id) => id === image.id) >= 0) && image.thumbnailUrl),
        ),
      )
      .subscribe((images) => this.filteredImagesSubject.next(images));
  }

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
