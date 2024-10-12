import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, distinctUntilChanged, filter, map, Subscription, switchMap, tap, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { GalleriesService } from '@app/galleries/services/galleries.service';
import { ImageResponse, ImageService, UpdateImageDto } from '@app/gen/ogm-backend';
import { MatDivider } from '@angular/material/divider';
import { ImageTagsComponent } from '@app/shared/components/image-tags/image-tags.component';
import { AsyncPipe } from '@angular/common';
import { ImageComponent } from '@app/shared/components/image/image.component';

@Component({
  selector: 'ogm-gallery-image',
  standalone: true,
  imports: [MatDivider, ImageTagsComponent, AsyncPipe, ImageComponent],
  templateUrl: './gallery-image.component.html',
  styleUrl: './gallery-image.component.scss',
})
export class GalleryImageComponent implements OnInit, OnDestroy {
  loadingImage = true;
  selectedImageSubject = new BehaviorSubject<ImageResponse>(undefined);

  private routeSubscription: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly galleriesService: GalleriesService,
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
      this.galleriesService.updateImage(image);
    });
  }

  private fetchImageOnIdChange(): void {
    this.routeSubscription = this.route.paramMap
      .pipe(
        map((params) => {
          const imageId = parseInt(params.get(GalleriesService.IMAGE_ID_PARAM));
          if (isNaN(imageId)) {
            void this.router.navigateByUrl(`/galleries/${this.galleriesService.getSelectedGalleryIdValue()}`);
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
                void this.router.navigateByUrl(`/galleries/${this.galleriesService.getSelectedGalleryIdValue()}`);
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
