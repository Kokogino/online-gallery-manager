import { Component, effect, input, OnInit, output } from '@angular/core';
import { GalleryResponse, GalleryService, ImageResponse, TagResponse, TagService, UpdateImageDto } from '@app/gen/ogm-backend';
import { finalize, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ImageForm } from '@app/shared/model/image-form';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NoDataMessageComponent } from '@app/shared/components/no-data-message/no-data-message.component';
import { isNil } from 'lodash-es';
import { MatButton } from '@angular/material/button';
import { TagGroupSelectComponent } from '@app/shared/components/tag-group-select/tag-group-select.component';
import { TagGroupSelection } from '@app/shared/model/tag-group-selection';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ogm-image-tags',
  imports: [
    ReactiveFormsModule,
    MatIcon,
    RouterLink,
    MatChipListbox,
    MatChipOption,
    MatProgressBar,
    NoDataMessageComponent,
    MatButton,
    TagGroupSelectComponent,
    NgClass,
  ],
  templateUrl: './image-tags.component.html',
  styleUrl: './image-tags.component.scss',
})
export class ImageTagsComponent implements OnInit {
  readonly image = input.required<ImageResponse>();

  readonly updateImage = output<UpdateImageDto>();

  readonly deleteImage = output<boolean>();

  allTags: TagResponse[];
  gallery: GalleryResponse;

  loadingAllTags = true;
  loadingGallery = false;

  imageForm: FormGroup<ImageForm>;

  tagGroupSelection = new FormControl<TagGroupSelection>(TagGroupSelection.Hidden);

  protected readonly isNil = isNil;

  private formSubscription: Subscription;

  constructor(
    private readonly tagService: TagService,
    private readonly galleryService: GalleryService,
    private readonly formBuilder: FormBuilder,
  ) {
    effect(() => {
      const image = this.image();
      if (!isNil(image.galleryId)) {
        if (image.galleryId !== this.gallery?.id) {
          this.loadingGallery = true;
          this.galleryService
            .getGalleryById(image.galleryId)
            .pipe(finalize(() => (this.loadingGallery = false)))
            .subscribe((gallery) => (this.gallery = gallery));
        }
      } else {
        this.gallery = undefined;
      }
      this.setupImageForm();
    });
  }

  ngOnInit(): void {
    this.tagService
      .getAllTags()
      .pipe(finalize(() => (this.loadingAllTags = false)))
      .subscribe((tags) => (this.allTags = tags));
  }

  galleryHasTag(tagId: number): boolean {
    return this.gallery?.tags?.findIndex((tag) => tag.tagId === tagId) >= 0;
  }

  shouldShowTag(tag: TagResponse): boolean {
    const tagGroup = this.tagGroupSelection.value;
    return (
      tagGroup === TagGroupSelection.All ||
      (tagGroup === TagGroupSelection.Hidden && !tag.showTag) ||
      (tagGroup === TagGroupSelection.Shown && tag.showTag)
    );
  }

  private setupImageForm(): void {
    this.imageForm = this.formBuilder.group({
      galleryId: [this.image().galleryId],
      tagIds: [this.image().tags?.map((tag) => tag.tagId)],
    });

    this.formSubscription?.unsubscribe();
    this.formSubscription = this.imageForm.valueChanges.subscribe((formValues) => {
      const updateImageDto: UpdateImageDto = {
        galleryId: formValues.galleryId,
        tagIds: formValues.tagIds,
      };
      this.updateImage.emit(updateImageDto);
    });
  }
}
