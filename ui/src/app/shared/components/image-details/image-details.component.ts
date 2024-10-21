import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, distinctUntilChanged, filter, map, Subscription, switchMap, tap, throwError } from 'rxjs';
import { ImageResponse, ImageService, UpdateImageDto } from '@app/gen/ogm-backend';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageTagsComponent } from '@app/shared/components/image-tags/image-tags.component';
import { MatDivider } from '@angular/material/divider';
import { ImageComponent } from '@app/shared/components/image/image.component';
import { AsyncPipe } from '@angular/common';
import { ImageLoaderService } from '@app/shared/util/image-loader-service';
import { MediaQueryService } from '@app/shared/services/media-query.service';
import { FilterQueryInputComponent } from '@app/shared/components/filter-query-input/filter-query-input.component';
import { FormsModule } from '@angular/forms';
import { GalleryTagsAndMetadataComponent } from '@app/galleries/components/gallery-tags-and-metadata/gallery-tags-and-metadata.component';
import { ImageListComponent } from '@app/shared/components/image-list/image-list.component';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'ogm-image-details',
  standalone: true,
  imports: [
    ImageTagsComponent,
    MatDivider,
    ImageComponent,
    AsyncPipe,
    FilterQueryInputComponent,
    FormsModule,
    GalleryTagsAndMetadataComponent,
    ImageListComponent,
    MatButton,
    MatCheckbox,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatFabButton,
    MatIcon,
  ],
  templateUrl: './image-details.component.html',
  styleUrl: './image-details.component.scss',
})
export class ImageDetailsComponent implements OnInit, OnDestroy {
  @Input({ required: true })
  imageLoaderService: ImageLoaderService;

  @Input({ required: true })
  fallbackRoute: string;

  @Input({ required: true })
  imageIdParam: string;

  loadingImage = true;
  selectedImageSubject = new BehaviorSubject<ImageResponse>(undefined);

  private routeSubscription: Subscription;

  constructor(
    public readonly mediaQueryService: MediaQueryService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly imageService: ImageService,
  ) {}

  ngOnInit(): void {
    this.fetchImageOnIdChange();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  updateImage(updateImageDto: UpdateImageDto, originalImage: ImageResponse): void {
    this.imageService.updateImage(originalImage.id, updateImageDto).subscribe((image) => {
      this.selectedImageSubject.next(image);
      this.imageLoaderService.updateImage(image);
    });
  }

  private fetchImageOnIdChange(): void {
    this.routeSubscription = this.route.paramMap
      .pipe(
        map((params) => {
          const imageId = parseInt(params.get(this.imageIdParam));
          if (isNaN(imageId)) {
            void this.router.navigateByUrl(this.fallbackRoute);
            return undefined;
          }
          return imageId;
        }),
        filter((id) => id !== undefined),
        distinctUntilChanged(),
        tap(() => (this.loadingImage = true)),
        switchMap((id) =>
          this.imageService.getImageById(id).pipe(
            catchError((err) => {
              if (err.error?.errorCode === 6503) {
                void this.router.navigateByUrl(this.fallbackRoute);
              }
              return throwError(() => err);
            }),
          ),
        ),
        tap(() => (this.loadingImage = false)),
      )
      .subscribe((image) => this.selectedImageSubject.next(image));
  }
}
