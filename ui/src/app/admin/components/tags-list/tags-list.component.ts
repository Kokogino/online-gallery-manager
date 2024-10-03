import { Component, OnInit } from '@angular/core';
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
import { AutocompleteInputComponent } from '@app/shared/components/autocomplete-input/autocomplete-input.component';

@Component({
  selector: 'ogm-tags-list',
  standalone: true,
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
    AutocompleteInputComponent,
  ],
  templateUrl: './tags-list.component.html',
  styleUrl: './tags-list.component.scss',
})
export class TagsListComponent implements OnInit {
  tags: TagResponse[];

  searchTags = new FormControl('');

  loading = true;

  newTagForm: FormGroup<TagForm>;

  editTagForm: FormGroup<TagForm>;

  editingTagId: number;

  constructor(
    private readonly tagService: TagService,
    private readonly formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.tagService
      .getAllTags()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((tags) => (this.tags = tags));
  }

  isTagFiltered(tag: TagResponse): boolean {
    return !containsStringsIgnoringAccentsAndCase(tag.name, this.searchTags.value);
  }

  isEditingOrCreating(): boolean {
    return Boolean(this.newTagForm || this.editTagForm);
  }

  cancelEditingTag() {
    this.editingTagId = undefined;
    this.editTagForm = undefined;
  }

  cancelNewTag() {
    this.newTagForm = undefined;
  }

  editTag(tag: TagResponse) {
    if (!this.isEditingOrCreating()) {
      const tagNames = this.tags.filter((t) => t.id !== tag.id).map((tag) => tag.name);
      this.editTagForm = this.formBuilder.group({
        tagName: [tag.name, [CustomFormValidators.trimmedRequired, CustomFormValidators.maxNTimesIn(0, tagNames)]],
        showTag: [tag.showTag],
      });
      this.editingTagId = tag.id;
    }
  }

  createNewTag() {
    const tagNames = this.tags.map((tag) => tag.name);
    this.newTagForm = this.formBuilder.group({
      tagName: ['', [CustomFormValidators.trimmedRequired, CustomFormValidators.maxNTimesIn(0, tagNames)]],
      showTag: [false],
    });
  }

  saveEditingTag() {
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

  saveNewTag() {
    if (this.newTagForm.valid) {
      this.tagService
        .createTag({
          name: this.newTagForm.value.tagName,
          showTag: this.newTagForm.value.showTag,
        })
        .subscribe((tag) => {
          this.tags = [tag, ...this.tags];
          this.cancelNewTag();
        });
    }
  }

  getTagName = (tag: TagResponse): string => tag.name;
}
