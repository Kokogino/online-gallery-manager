import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TagsComponent } from '@app/shared/components/tags/tags.component';
import { AsyncPipe, NgClass } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MediaQueryService } from '@app/shared/services/media-query.service';
import { TagResponse } from '@app/gen/ogm-backend';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterQueryInputComponent } from '@app/shared/components/filter-query-input/filter-query-input.component';
import { ImagesService } from '@app/images/services/images.service';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { ImageListComponent } from '@app/shared/components/image-list/image-list.component';
import { RouterOutlet } from '@angular/router';
import { ImagesFilterForm } from '@app/images/model/images-filter-form';

@Component({
  selector: 'ogm-images',
  standalone: true,
  imports: [
    TagsComponent,
    AsyncPipe,
    MatDivider,
    FilterQueryInputComponent,
    FormsModule,
    MatButton,
    MatCheckbox,
    ReactiveFormsModule,
    ImageListComponent,
    RouterOutlet,
    NgClass,
  ],
  templateUrl: './images.component.html',
  styleUrl: './images.component.scss',
})
export class ImagesComponent implements OnInit {
  filterForm: FormGroup<ImagesFilterForm>;

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
