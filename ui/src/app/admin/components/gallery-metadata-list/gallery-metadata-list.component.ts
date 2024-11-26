import { Component, OnInit } from '@angular/core';
import { SearchInputComponent } from '@app/shared/components/search-input/search-input.component';
import { MatDivider } from '@angular/material/divider';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { NoDataMessageComponent } from '@app/shared/components/no-data-message/no-data-message.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { GalleryMetadataResponse, GalleryMetadataService, GalleryMetadataType } from '@app/gen/ogm-backend';
import { finalize } from 'rxjs';
import { containsStringsIgnoringAccentsAndCase } from '@app/shared/util/string-compare';
import { CustomFormValidators } from '@app/shared/util/custom-form-validators';
import { GalleryMetadataForm } from '@app/admin/model/gallery-metadata-form';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'ogm-gallery-metadata-list',
  imports: [
    MatProgressBar,
    MatIcon,
    NoDataMessageComponent,
    MatIconButton,
    MatTooltip,
    MatInput,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatDivider,
    NgClass,
    SearchInputComponent,
    MatOption,
    MatSelect,
  ],
  templateUrl: './gallery-metadata-list.component.html',
  styleUrl: './gallery-metadata-list.component.scss',
})
export class GalleryMetadataListComponent implements OnInit {
  galleryMetadata: GalleryMetadataResponse[];

  searchGalleryMetadata = new FormControl('');

  loading = true;

  newMetadataForm: FormGroup<GalleryMetadataForm>;

  editMetadataForm: FormGroup<GalleryMetadataForm>;

  editingMetadataId: number;

  types = Object.values(GalleryMetadataType);

  constructor(
    private readonly galleryMetadataService: GalleryMetadataService,
    private readonly formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.galleryMetadataService
      .getAllGalleryMetadata()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((metadata) => (this.galleryMetadata = metadata));
  }

  isMetadataFiltered(metadata: GalleryMetadataResponse): boolean {
    return !containsStringsIgnoringAccentsAndCase(metadata.name, this.searchGalleryMetadata.value);
  }

  isEditingOrCreating(): boolean {
    return Boolean(this.newMetadataForm || this.editMetadataForm);
  }

  cancelEditingMetadata(): void {
    this.editingMetadataId = undefined;
    this.editMetadataForm = undefined;
  }

  cancelNewMetadata(): void {
    this.newMetadataForm = undefined;
  }

  editMetadata(metadata: GalleryMetadataResponse): void {
    if (!this.isEditingOrCreating()) {
      const metadataNames = this.galleryMetadata.filter((t) => t.id !== metadata.id).map((metadata) => metadata.name);
      this.editMetadataForm = this.formBuilder.group({
        metadataName: [metadata.name, [CustomFormValidators.trimmedRequired, CustomFormValidators.maxNTimesIn(0, metadataNames)]],
        metadataType: [metadata.type, Validators.required],
      });
      this.editingMetadataId = metadata.id;
    }
  }

  createNewMetadata(): void {
    const metadataNames = this.galleryMetadata.map((metadata) => metadata.name);
    this.newMetadataForm = this.formBuilder.group({
      metadataName: ['', [CustomFormValidators.trimmedRequired, CustomFormValidators.maxNTimesIn(0, metadataNames)]],
      metadataType: [GalleryMetadataType.String, Validators.required],
    });
  }

  saveEditingMetadata(): void {
    if (this.editMetadataForm.valid) {
      this.galleryMetadataService
        .updateGalleryMetadata(this.editingMetadataId, {
          name: this.editMetadataForm.value.metadataName,
        })
        .subscribe((metadata) => {
          const oldMetadata = this.galleryMetadata.find((m) => m.id === metadata.id);
          oldMetadata.name = metadata.name;
          this.cancelEditingMetadata();
        });
    }
  }

  saveNewMetadata(): void {
    if (this.newMetadataForm.valid) {
      this.galleryMetadataService
        .createGalleryMetadata({
          name: this.newMetadataForm.value.metadataName,
          type: this.newMetadataForm.value.metadataType,
        })
        .subscribe((metadata) => {
          this.galleryMetadata = [metadata, ...this.galleryMetadata];
          this.cancelNewMetadata();
        });
    }
  }

  typeToString(type: GalleryMetadataType): string {
    switch (type) {
      case GalleryMetadataType.String:
        return 'String';
      case GalleryMetadataType.Date:
        return 'Date';
      case GalleryMetadataType.Integer:
        return 'Integer';
      case GalleryMetadataType.Double:
        return 'Decimal';
    }
    throw new Error('Invalid Gallery Metadata type');
  }
}
