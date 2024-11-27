import { Component, effect, OnInit, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadForm } from '@app/upload/model/upload-form';
import { GalleryChoice, GalleryResponse, GalleryService, ImageHost, ImageService } from '@app/gen/ogm-backend';
import { CustomFormValidators } from '@app/shared/util/custom-form-validators';
import { uploadFormValidator } from '@app/upload/util/upload-form-validator';
import { ImageHostInputComponent } from '@app/upload/components/image-host-input/image-host-input.component';
import { BehaviorSubject, finalize } from 'rxjs';
import { GalleryChoiceInputComponent } from '@app/upload/components/gallery-choice-input/gallery-choice-input.component';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { AutocompleteInputComponent } from '@app/shared/components/autocomplete-input/autocomplete-input.component';
import { AsyncPipe } from '@angular/common';
import { CollectionsService } from '@app/shared/services/collections.service';

@Component({
  selector: 'ogm-upload',
  imports: [
    ReactiveFormsModule,
    ImageHostInputComponent,
    GalleryChoiceInputComponent,
    MatFormField,
    MatInput,
    MatLabel,
    MatError,
    MatButton,
    AutocompleteInputComponent,
    AsyncPipe,
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent implements OnInit {
  readonly form = viewChild<FormGroupDirective>('form');

  uploadForm: FormGroup<UploadForm>;

  galleries = new BehaviorSubject<GalleryResponse[]>(undefined);

  GalleryChoice = GalleryChoice;

  uploading = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly galleryService: GalleryService,
    private readonly imageService: ImageService,
    private readonly collectionsService: CollectionsService,
  ) {
    effect(() => {
      this.uploadForm.controls.gallery.reset(null);
      this.galleryService
        .findGalleries({
          collectionId: this.collectionsService.selectedCollectionId(),
          randomizeOrder: false,
          startingDate: new Date().toISOString(),
        })
        .subscribe((galleries) => this.galleries.next(galleries));
    });
  }

  ngOnInit(): void {
    this.uploadForm = this.formBuilder.group(
      {
        host: [ImageHost.Imgbox, Validators.required],
        galleryChoice: [GalleryChoice.NewGallery, Validators.required],
        newGalleryName: [''],
        gallery: [null],
        editUrl: [''],
        bbCode: ['', CustomFormValidators.trimmedRequired],
      },
      { validators: uploadFormValidator },
    );
  }

  upload(): void {
    if (this.isValid()) {
      this.uploading = true;
      const formValues = this.uploadForm.getRawValue();
      this.imageService
        .createImages({
          collectionId: this.collectionsService.selectedCollectionId(),
          host: formValues.host,
          galleryChoice: formValues.galleryChoice,
          bbCode: formValues.bbCode,
          editUrl: formValues.editUrl,
          newGalleryName: formValues.galleryChoice === GalleryChoice.NewGallery ? formValues.newGalleryName : undefined,
          galleryId: formValues.galleryChoice === GalleryChoice.AddToGallery ? formValues.gallery.id : undefined,
        })
        .pipe(finalize(() => (this.uploading = false)))
        .subscribe({ next: () => this.resetForm() });
    }
  }

  isValid(): boolean {
    return this.uploadForm.valid && !this.uploading;
  }

  getGalleryName = (gallery: GalleryResponse): string => gallery.name || 'Unnamed Gallery';

  private resetForm(): void {
    this.form().resetForm({
      host: ImageHost.Imgbox,
      galleryChoice: this.uploadForm.controls.galleryChoice.value,
      newGalleryName: '',
      gallery: null,
      editUrl: '',
      bbCode: '',
    });
  }
}
