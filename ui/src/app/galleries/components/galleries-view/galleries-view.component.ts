import { Component, OnInit, viewChild } from '@angular/core';
import { TagsComponent } from '@app/shared/components/tags/tags.component';
import { MediaQueryService } from '@app/shared/services/media-query.service';
import { MatDivider } from '@angular/material/divider';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FilterQueryInputComponent } from '@app/shared/components/filter-query-input/filter-query-input.component';
import { GalleryResponse, TagResponse } from '@app/gen/ogm-backend';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NoDataMessageComponent } from '@app/shared/components/no-data-message/no-data-message.component';
import { RouterLink } from '@angular/router';
import { GalleriesService } from '@app/galleries/services/galleries.service';
import { Observable } from 'rxjs';
import { GalleryFilterForm } from '@app/galleries/model/gallery-filter-form';
import { AsyncPipe } from '@angular/common';
import { SearchInputComponent } from '@app/shared/components/search-input/search-input.component';
import { GalleryListItemComponent } from '@app/galleries/components/gallery-list-item/gallery-list-item.component';

@Component({
  selector: 'ogm-galleries-view',
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
    AsyncPipe,
    SearchInputComponent,
    GalleryListItemComponent,
  ],
  templateUrl: './galleries-view.component.html',
  styleUrl: './galleries-view.component.scss',
})
export class GalleriesViewComponent implements OnInit {
  readonly queryInput = viewChild<FilterQueryInputComponent>('queryInput');

  filterForm: FormGroup<GalleryFilterForm>;

  searchControl: FormControl<string>;

  galleries: Observable<GalleryResponse[]>;

  loading: Observable<boolean>;

  constructor(
    public readonly mediaQueryService: MediaQueryService,
    private readonly galleriesService: GalleriesService,
  ) {}

  ngOnInit(): void {
    this.filterForm = this.galleriesService.galleriesFilterForm;
    this.searchControl = this.galleriesService.gallerySearchControl;
    this.loading = this.galleriesService.loadingGalleries$;
    this.galleries = this.galleriesService.filteredGalleries$;
  }

  findGalleries(): void {
    this.galleriesService.findGalleries();
  }

  addTagToQuery(tag: TagResponse): void {
    this.queryInput().addTag(tag);
    this.queryInput().focus();
  }
}
