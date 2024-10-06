import { Component, OnInit } from '@angular/core';
import { GalleryResponse } from '@app/gen/ogm-backend';
import { Observable } from 'rxjs';
import { GalleriesService } from '@app/galleries/services/galleries.service';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'ogm-galleries-title',
  standalone: true,
  imports: [AsyncPipe, MatProgressSpinner, RouterLink, RouterLinkActive, MatIcon],
  templateUrl: './galleries-title.component.html',
  styleUrl: './galleries-title.component.scss',
})
export class GalleriesTitleComponent implements OnInit {
  gallery$: Observable<GalleryResponse>;

  loadingGallery$: Observable<boolean>;

  constructor(private readonly galleriesService: GalleriesService) {}

  ngOnInit(): void {
    this.gallery$ = this.galleriesService.selectedGallery$;
    this.loadingGallery$ = this.galleriesService.loadingGallery$;
  }
}
