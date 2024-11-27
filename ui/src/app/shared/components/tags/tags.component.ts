import { Component, effect, output } from '@angular/core';
import { TagResponse, TagService } from '@app/gen/ogm-backend';
import { finalize } from 'rxjs';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { NoDataMessageComponent } from '@app/shared/components/no-data-message/no-data-message.component';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CollectionsService } from '@app/shared/services/collections.service';

@Component({
  selector: 'ogm-tags',
  imports: [MatChipSet, MatChip, MatIcon, NoDataMessageComponent, MatProgressBar],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.scss',
})
export class TagsComponent {
  readonly tagClicked = output<TagResponse>();

  allTags: TagResponse[];

  loading = true;

  constructor(
    private readonly tagService: TagService,
    private readonly collectionsService: CollectionsService,
  ) {
    effect(() =>
      this.tagService
        .getAllTags(this.collectionsService.selectedCollectionId())
        .pipe(finalize(() => (this.loading = false)))
        .subscribe((tags) => (this.allTags = tags)),
    );
  }

  tagOnClick(tag: TagResponse): void {
    this.tagClicked.emit(tag);
  }
}
