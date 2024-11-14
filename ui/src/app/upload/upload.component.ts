import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadForm } from '@app/upload/model/upload-form';
import { GalleryChoice, GalleryResponse, GalleryService, ImageHost, ImageService } from '@app/gen/ogm-backend';
import { CustomFormValidators } from '@app/shared/util/custom-form-validators';
import { uploadFormValidator } from '@app/upload/util/upload-form-validator';
import { ImageHostInputComponent } from '@app/upload/components/image-host-input/image-host-input.component';
import { finalize, Observable } from 'rxjs';
import { GalleryChoiceInputComponent } from '@app/upload/components/gallery-choice-input/gallery-choice-input.component';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { AutocompleteInputComponent } from '@app/shared/components/autocomplete-input/autocomplete-input.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'ogm-upload',
  standalone: true,
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
  uploadForm: FormGroup<UploadForm>;

  galleries: Observable<GalleryResponse[]>;

  GalleryChoice = GalleryChoice;

  uploading = false;

  @ViewChild('form')
  form: FormGroupDirective;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly galleryService: GalleryService,
    private readonly imageService: ImageService,
  ) {}

  ngOnInit(): void {
    this.uploadForm = this.formBuilder.group(
      {
        host: [ImageHost.Imgbox, Validators.required],
        galleryChoice: [GalleryChoice.NewGallery, Validators.required],
        newGalleryName: [''],
        gallery: [undefined],
        editUrl: [''],
        bbCode: ['', CustomFormValidators.trimmedRequired],
      },
      { validators: uploadFormValidator },
    );

    this.galleries = this.galleryService.findGalleries({ randomizeOrder: false, startingDate: new Date().toISOString() });
  }

  upload(): void {
    if (this.isValid()) {
      this.uploading = true;
      const formValues = this.uploadForm.getRawValue();
      this.imageService
        .createImages({
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

  getGalleryName = (gallery: GalleryResponse): string => (gallery.name?.length > 0 ? gallery.name : 'Unnamed Gallery');

  private resetForm(): void {
    this.form.resetForm({
      host: ImageHost.Imgbox,
      galleryChoice: this.uploadForm.controls.galleryChoice.value,
      newGalleryName: '',
      gallery: undefined,
      editUrl: '',
      bbCode: '',
    });
  }
}
