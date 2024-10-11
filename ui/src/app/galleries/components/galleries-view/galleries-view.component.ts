import { Component, OnInit, ViewChild } from '@angular/core';
import { TagsComponent } from '@app/shared/components/tags/tags.component';
import { MediaQueryService } from '@app/core/services/media-query.service';
import { MatDivider } from '@angular/material/divider';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FilterQueryInputComponent } from '@app/shared/components/filter-query-input/filter-query-input.component';
import { GalleryMetadataType, GalleryResponse, TagResponse } from '@app/gen/ogm-backend';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NoDataMessageComponent } from '@app/shared/components/no-data-message/no-data-message.component';
import { RouterLink } from '@angular/router';
import { MatRipple } from '@angular/material/core';
import { GalleriesService } from '@app/galleries/services/galleries.service';
import { Observable } from 'rxjs';
import { GalleryFilterForm } from '@app/shared/model/gallery-filter-form';
import { AsyncPipe, DatePipe } from '@angular/common';
import { MatChip } from '@angular/material/chips';

@Component({
  selector: 'ogm-galleries-view',
  standalone: true,
  imports: [
    TagsComponent,
    MatDivider,
    ReactiveFormsModule,
    FilterQueryInputComponent,
    MatCheckbox,
    MatButton,
    MatProgressBar,
    NoDataMessageComponent,
    RouterLink,
    MatRipple,
    AsyncPipe,
    MatChip,
    DatePipe,
  ],
  templateUrl: './galleries-view.component.html',
  styleUrl: './galleries-view.component.scss',
})
export class GalleriesViewComponent implements OnInit {
  filterForm: FormGroup<GalleryFilterForm>;

  @ViewChild('queryInput')
  queryInput: FilterQueryInputComponent;

  galleries: Observable<GalleryResponse[]>;

  loading: Observable<boolean>;

  GalleryMetadataType = GalleryMetadataType;

  constructor(
    public readonly mediaQueryService: MediaQueryService,
    private readonly galleriesService: GalleriesService,
  ) {}

  ngOnInit(): void {
    this.filterForm = this.galleriesService.galleriesFilterForm;
    this.loading = this.galleriesService.loadingGalleries$;
    this.galleries = this.galleriesService.galleries$;
  }

  findGalleries(): void {
    this.galleriesService.findGalleries();
  }

  addTagToQuery(tag: TagResponse): void {
    this.queryInput.addTag(tag);
    this.queryInput.focus();
  }
}
