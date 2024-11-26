import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, distinctUntilChanged, filter, map, Observable, Subscription, switchMap, tap, throwError } from 'rxjs';
import { ImageResponse, ImageService, UpdateImageDto } from '@app/gen/ogm-backend';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageTagsComponent } from '@app/shared/components/image-tags/image-tags.component';
import { MatDivider } from '@angular/material/divider';
import { ImageComponent } from '@app/shared/components/image/image.component';
import { AsyncPipe } from '@angular/common';
import { ImageLoaderService } from '@app/shared/util/image-loader-service';
import { MediaQueryService } from '@app/shared/services/media-query.service';
import { FormsModule } from '@angular/forms';
import { MatFabButton } from '@angular/material/button';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatIcon } from '@angular/material/icon';
import { SharedDialogService } from '@app/shared/services/shared-dialog.service';
import { DeletingOverlayComponent } from '@app/shared/components/deleting-overlay/deleting-overlay.component';

@Component({
  selector: 'ogm-image-details',
  imports: [
    ImageTagsComponent,
    MatDivider,
    ImageComponent,
    AsyncPipe,
    FormsModule,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatFabButton,
    MatIcon,
    DeletingOverlayComponent,
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

  deletingImageId$: Observable<number>;

  private routeSubscription: Subscription;

  constructor(
    public readonly mediaQueryService: MediaQueryService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly imageService: ImageService,
    private readonly sharedDialogService: SharedDialogService,
  ) {}

  ngOnInit(): void {
    this.fetchImageOnIdChange();

    this.deletingImageId$ = this.imageLoaderService.deletingImageId$;
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

  deleteImage(): void {
    this.sharedDialogService
      .openDeleteConfirmationDialog({
        title: `Delete Image`,
        message: 'Are you sure you want to delete this image?',
      })
      .pipe(filter(Boolean))
      .subscribe(() => this.imageLoaderService.deleteImage(this.selectedImageSubject.value.id));
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
