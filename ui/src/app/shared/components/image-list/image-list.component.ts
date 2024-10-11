import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ImageLoaderService } from '@app/shared/util/image-loader-service';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { ImageResponse } from '@app/gen/ogm-backend';
import { AsyncPipe } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NoDataMessageComponent } from '@app/shared/components/no-data-message/no-data-message.component';
import { MediaQueryService } from '@app/core/services/media-query.service';
import { random } from 'lodash-es';
import { ImageThumbnailComponent } from '@app/shared/components/image-thumbnail/image-thumbnail.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ogm-image-list',
  standalone: true,
  imports: [AsyncPipe, MatProgressBar, NoDataMessageComponent, ImageThumbnailComponent, RouterLink],
  templateUrl: './image-list.component.html',
  styleUrl: './image-list.component.scss',
})
export class ImageListComponent implements OnInit, OnDestroy {
  @Input({ required: true })
  imageLoaderService: ImageLoaderService;

  @Input({ required: true })
  imageDetailsBaseRoute: string;

  images$: Observable<ImageResponse[]>;

  loading$: Observable<boolean>;

  columns: number[] = [];

  columnSubscription: Subscription;

  constructor(private readonly mediaQueryService: MediaQueryService) {}

  ngOnInit(): void {
    this.images$ = this.imageLoaderService.images$;
    this.loading$ = this.imageLoaderService.loadingImages$;

    this.columnSubscription = combineLatest([
      this.mediaQueryService.isMaximumMobileLayout$,
      this.mediaQueryService.isMaximumTabletLayout$,
      this.mediaQueryService.isMaximumDesktopLayout$,
    ]).subscribe(([biggerThanMobile, biggerThanTablet, biggerThanDesktop]) => {
      const numberOfColumns = 1 + (!biggerThanMobile ? 1 : 0) + (!biggerThanTablet ? 2 : 0) + (!biggerThanDesktop ? 2 : 0);
      this.columns = [...Array(numberOfColumns)].map(() => random(true));
    });
  }

  ngOnDestroy(): void {
    this.columnSubscription?.unsubscribe();
  }

  loaded(index: number, imageCount: number): void {
    if (index >= Math.max(imageCount - this.columns.length, 0)) {
      this.imageLoaderService.loadMoreImages();
    }
  }
}
