import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, distinctUntilChanged, filter, map, Subscription, switchMap, tap, throwError } from 'rxjs';
import { ImageResponse, ImageService, UpdateImageDto } from '@app/gen/ogm-backend';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageTagsComponent } from '@app/shared/components/image-tags/image-tags.component';
import { MatDivider } from '@angular/material/divider';
import { ImageComponent } from '@app/shared/components/image/image.component';
import { AsyncPipe } from '@angular/common';
import { ImagesService } from '@app/images/services/images.service';

@Component({
  selector: 'ogm-image-details',
  standalone: true,
  imports: [ImageTagsComponent, MatDivider, ImageComponent, AsyncPipe],
  templateUrl: './image-details.component.html',
  styleUrl: './image-details.component.scss',
})
export class ImageDetailsComponent implements OnInit, OnDestroy {
  loadingImage = true;
  selectedImageSubject = new BehaviorSubject<ImageResponse>(undefined);

  private routeSubscription: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly imagesService: ImagesService,
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
      this.imagesService.updateImage(image);
    });
  }

  private fetchImageOnIdChange(): void {
    this.routeSubscription = this.route.paramMap
      .pipe(
        map((params) => {
          const imageId = parseInt(params.get(ImagesService.IMAGE_ID_PARAM));
          if (isNaN(imageId)) {
            void this.router.navigateByUrl(`/images`);
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
                void this.router.navigateByUrl(`/images`);
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
