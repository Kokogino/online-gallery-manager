import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TagResponse, TagService } from '@app/gen/ogm-backend';
import { finalize } from 'rxjs';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { NoDataMessageComponent } from '@app/shared/components/no-data-message/no-data-message.component';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'ogm-tags',
  standalone: true,
  imports: [MatChipSet, MatChip, MatIcon, NoDataMessageComponent, MatProgressBar],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.scss',
})
export class TagsComponent implements OnInit {
  @Output()
  tagClicked = new EventEmitter<TagResponse>();

  allTags: TagResponse[];

  loading = true;

  constructor(private readonly tagService: TagService) {}

  ngOnInit(): void {
    this.tagService
      .getAllTags()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((tags) => (this.allTags = tags));
  }

  tagOnClick(tag: TagResponse): void {
    this.tagClicked.emit(tag);
  }
}
