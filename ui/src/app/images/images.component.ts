import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TagsComponent } from '@app/shared/components/tags/tags.component';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MediaQueryService } from '@app/shared/services/media-query.service';
import { TagResponse } from '@app/gen/ogm-backend';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GalleryFilterForm } from '@app/galleries/model/gallery-filter-form';
import { FilterQueryInputComponent } from '@app/shared/components/filter-query-input/filter-query-input.component';
import { ImagesService } from '@app/images/services/images.service';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChip } from '@angular/material/chips';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatRipple } from '@angular/material/core';
import { NoDataMessageComponent } from '@app/shared/components/no-data-message/no-data-message.component';
import { ImageListComponent } from '@app/shared/components/image-list/image-list.component';
import { GalleryDetailsComponent } from '@app/galleries/components/gallery-details/gallery-details.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'ogm-images',
  standalone: true,
  imports: [
    TagsComponent,
    AsyncPipe,
    MatDivider,
    DatePipe,
    FilterQueryInputComponent,
    FormsModule,
    MatButton,
    MatCheckbox,
    MatChip,
    MatProgressBar,
    MatRipple,
    NoDataMessageComponent,
    ReactiveFormsModule,
    ImageListComponent,
    GalleryDetailsComponent,
    RouterOutlet,
    NgClass,
  ],
  templateUrl: './images.component.html',
  styleUrl: './images.component.scss',
})
export class ImagesComponent implements OnInit {
  filterForm: FormGroup<GalleryFilterForm>;

  @ViewChild('queryInput')
  queryInput: FilterQueryInputComponent;

  showOutlet = false;

  constructor(
    public readonly mediaQueryService: MediaQueryService,
    public readonly imagesService: ImagesService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.filterForm = this.imagesService.imagesFilterForm;
  }

  findImages(): void {
    this.imagesService.findImages();
  }

  addTagToQuery(tag: TagResponse): void {
    this.queryInput.addTag(tag);
    this.queryInput.focus();
  }

  toggleOutletVisibility(showOutlet: boolean): void {
    this.showOutlet = showOutlet;
    this.changeDetectorRef.detectChanges();
  }
}
