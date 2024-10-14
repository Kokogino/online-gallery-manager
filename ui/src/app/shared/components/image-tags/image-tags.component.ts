import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { GalleryResponse, GalleryService, ImageResponse, TagResponse, TagService, UpdateImageDto } from '@app/gen/ogm-backend';
import { debounceTime, finalize, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ImageForm } from '@app/shared/model/image-form';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NoDataMessageComponent } from '@app/shared/components/no-data-message/no-data-message.component';
import { AsyncPipe } from '@angular/common';
import { isNil } from 'lodash-es';

@Component({
  selector: 'ogm-image-tags',
  standalone: true,
  imports: [ReactiveFormsModule, MatIcon, RouterLink, MatChipListbox, MatChipOption, MatProgressBar, NoDataMessageComponent, AsyncPipe],
  templateUrl: './image-tags.component.html',
  styleUrl: './image-tags.component.scss',
})
export class ImageTagsComponent implements OnInit, OnChanges {
  @Input({ required: true })
  image: ImageResponse;

  @Output()
  updateImage = new EventEmitter<UpdateImageDto>();

  allTags: TagResponse[];
  gallery: GalleryResponse;

  loadingAllTags = true;
  loadingGallery = false;

  imageForm: FormGroup<ImageForm>;

  protected readonly isNil = isNil;

  private formSubscription: Subscription;

  constructor(
    private readonly tagService: TagService,
    private readonly galleryService: GalleryService,
    private readonly formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.tagService
      .getAllTags()
      .pipe(finalize(() => (this.loadingAllTags = false)))
      .subscribe((tags) => (this.allTags = tags));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.image?.currentValue) {
      if (!isNil(this.image.galleryId)) {
        if (this.image.galleryId !== this.gallery?.id) {
          this.loadingGallery = true;
          this.galleryService
            .getGalleryById(this.image.galleryId)
            .pipe(finalize(() => (this.loadingGallery = false)))
            .subscribe((gallery) => (this.gallery = gallery));
        }
      } else {
        this.gallery = undefined;
      }
      this.setupImageForm();
    }
  }

  galleryHasTag(tagId: number): boolean {
    return this.gallery?.tags?.findIndex((tag) => tag.tagId === tagId) >= 0;
  }

  private setupImageForm(): void {
    this.imageForm = this.formBuilder.group({
      galleryId: [this.image.galleryId],
      tagIds: [this.image.tags?.map((tag) => tag.tagId)],
    });

    this.formSubscription?.unsubscribe();
    this.formSubscription = this.imageForm.valueChanges.pipe(debounceTime(500)).subscribe((formValues) => {
      const updateImageDto: UpdateImageDto = {
        galleryId: formValues.galleryId,
        tagIds: formValues.tagIds,
      };
      this.updateImage.emit(updateImageDto);
    });
  }
}
