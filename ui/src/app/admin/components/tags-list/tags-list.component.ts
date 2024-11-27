import { Component, effect } from '@angular/core';
import { TagResponse, TagService } from '@app/gen/ogm-backend';
import { finalize } from 'rxjs';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatIcon } from '@angular/material/icon';
import { NoDataMessageComponent } from '@app/shared/components/no-data-message/no-data-message.component';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatError, MatFormField, MatInput } from '@angular/material/input';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TagForm } from '@app/admin/model/tag-form';
import { CustomFormValidators } from '@app/shared/util/custom-form-validators';
import { MatLabel } from '@angular/material/form-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { containsStringsIgnoringAccentsAndCase } from '@app/shared/util/string-compare';
import { NgClass } from '@angular/common';
import { SearchInputComponent } from '@app/shared/components/search-input/search-input.component';
import { CollectionsService } from '@app/shared/services/collections.service';

@Component({
  selector: 'ogm-tags-list',
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
    MatCheckbox,
    MatDivider,
    NgClass,
    SearchInputComponent,
  ],
  templateUrl: './tags-list.component.html',
  styleUrl: './tags-list.component.scss',
})
export class TagsListComponent {
  tags: TagResponse[];

  searchTags = new FormControl('');

  loading = true;

  newTagForm: FormGroup<TagForm>;

  editTagForm: FormGroup<TagForm>;

  editingTagId: number;

  constructor(
    private readonly tagService: TagService,
    private readonly formBuilder: FormBuilder,
    private readonly collectionsService: CollectionsService,
  ) {
    effect(() =>
      this.tagService
        .getAllTags(this.collectionsService.selectedCollectionId())
        .pipe(finalize(() => (this.loading = false)))
        .subscribe((tags) => (this.tags = tags)),
    );
  }

  isTagFiltered(tag: TagResponse): boolean {
    return !containsStringsIgnoringAccentsAndCase(tag.name, this.searchTags.value);
  }

  isEditingOrCreating(): boolean {
    return Boolean(this.newTagForm || this.editTagForm);
  }

  cancelEditingTag(): void {
    this.editingTagId = undefined;
    this.editTagForm = undefined;
  }

  cancelNewTag(): void {
    this.newTagForm = undefined;
  }

  editTag(tag: TagResponse): void {
    if (!this.isEditingOrCreating()) {
      const tagNames = this.tags.filter((t) => t.id !== tag.id).map((tag) => tag.name);
      this.editTagForm = this.formBuilder.group({
        tagName: [tag.name, [CustomFormValidators.trimmedRequired, CustomFormValidators.maxNTimesIn(0, tagNames)]],
        showTag: [tag.showTag],
      });
      this.editingTagId = tag.id;
    }
  }

  createNewTag(): void {
    const tagNames = this.tags.map((tag) => tag.name);
    this.newTagForm = this.formBuilder.group({
      tagName: ['', [CustomFormValidators.trimmedRequired, CustomFormValidators.maxNTimesIn(0, tagNames)]],
      showTag: [false],
    });
  }

  saveEditingTag(): void {
    if (this.editTagForm.valid) {
      this.tagService
        .updateTag(this.editingTagId, {
          name: this.editTagForm.value.tagName,
          showTag: this.editTagForm.value.showTag,
        })
        .subscribe((tag) => {
          const oldTag = this.tags.find((t) => t.id === tag.id);
          oldTag.name = tag.name;
          oldTag.showTag = tag.showTag;
          this.cancelEditingTag();
        });
    }
  }

  saveNewTag(): void {
    if (this.newTagForm.valid) {
      this.tagService
        .createTag({
          collectionId: this.collectionsService.selectedCollectionId(),
          name: this.newTagForm.value.tagName,
          showTag: this.newTagForm.value.showTag,
        })
        .subscribe((tag) => {
          this.tags = [tag, ...this.tags];
          this.cancelNewTag();
        });
    }
  }
}
