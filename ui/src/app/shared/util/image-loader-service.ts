import { BehaviorSubject, distinctUntilChanged, filter, finalize, Observable, tap } from 'rxjs';
import { FilterExpressionDto, FindImagesDto, FindImagesResponse, ImageResponse, ImageService } from '@app/gen/ogm-backend';
import { random } from 'lodash-es';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ImagesFilterForm } from '@app/images/model/images-filter-form';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

export abstract class ImageLoaderService {
  public static readonly BATCH_SIZE = 20;

  public imagesFilterForm: FormGroup<ImagesFilterForm>;

  private loadingImagesSubject = new BehaviorSubject<boolean>(false);
  private deletingImageIdSubject = new BehaviorSubject<number>(undefined);
  private imagesSubject = new BehaviorSubject<ImageResponse[]>(undefined);

  private loadImagesSkip = new BehaviorSubject<number>(undefined);
  private imageFilter: FilterExpressionDto;
  private startingDate: Date;
  private randomnessSeed: number;
  private totalImagesCount: number;

  abstract fetchImages(findImagesDto: FindImagesDto): Observable<FindImagesResponse>;

  abstract basePath(): string;

  constructor(
    protected readonly imageService: ImageService,
    protected readonly formBuilder: FormBuilder,
    protected readonly snackBar: MatSnackBar,
    protected readonly router: Router,
  ) {
    this.initForm();
    this.setupImageLoad();
  }

  get loadingImages$(): Observable<boolean> {
    return this.loadingImagesSubject.asObservable();
  }

  get images$(): Observable<ImageResponse[]> {
    return this.imagesSubject.asObservable();
  }

  get deletingImageId$(): Observable<number> {
    return this.deletingImageIdSubject.asObservable();
  }

  findImages(): void {
    this.loadingImagesSubject.next(true);
    const formValues = this.imagesFilterForm.getRawValue();
    if (formValues.randomizeOrder) {
      this.randomnessSeed = random(-1, 1, true);
    } else {
      this.randomnessSeed = undefined;
    }
    this.imageFilter = formValues.filter;
    this.startingDate = new Date();
    const findImagesDto: FindImagesDto = {
      filter: formValues.filter,
      randomnessSeed: this.randomnessSeed,
      startingDate: this.startingDate.toISOString(),
      limit: ImageLoaderService.BATCH_SIZE,
      skip: 0,
    };
    this.loadImagesSkip.next(0);
    this.imagesSubject.next(undefined);
    this.fetchImages(findImagesDto)
      .pipe(finalize(() => this.loadingImagesSubject.next(false)))
      .subscribe((response) => {
        this.imagesSubject.next(response.images);
        this.totalImagesCount = response.totalCount;
      });
  }

  loadMoreImages(): void {
    const images = this.imagesSubject.value;
    if (this.totalImagesCount <= images.length) {
      return;
    }
    this.loadImagesSkip.next(images.length);
  }

  updateImage(updatedImage: ImageResponse): void {
    const images = this.imagesSubject.value;
    const index = images.findIndex((image) => image.id === updatedImage.id);
    if (index >= 0) {
      images.splice(index, 1, updatedImage);
      this.imagesSubject.next(images);
    }
  }

  deleteImage(imageId: number): void {
    this.deletingImageIdSubject.next(imageId);
    this.imageService
      .deleteImageById(imageId)
      .pipe(
        finalize(() => this.deletingImageIdSubject.next(undefined)),
        tap(() => {
          const images = this.imagesSubject.value;
          const index = images.findIndex((image) => image.id === imageId);
          const deletedImage = images.splice(index, 1);
          if (deletedImage) {
            this.totalImagesCount--;
          }
          this.imagesSubject.next(images);
        }),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl(this.basePath()),
        error: () => this.snackBar.open('Error occurred when deleting image', 'Dismiss'),
      });
  }

  addTagsToImages(tagIds: number[], imageIds: number[]): Observable<ImageResponse[]> {
    return this.imageService.addTagsToImages({ imageIds, tagIds }).pipe(tap((updatedImages) => this.updateImages(updatedImages)));
  }

  private updateImages(updatedImages: ImageResponse[]): void {
    const images = this.imagesSubject.value;
    for (let updatedImage of updatedImages) {
      const index = images.findIndex((image) => image.id === updatedImage.id);
      if (index >= 0) {
        images.splice(index, 1, updatedImage);
      }
    }
    this.imagesSubject.next(images);
  }

  private initForm(): void {
    this.imagesFilterForm = this.formBuilder.group({
      filter: [],
      randomizeOrder: [false],
    });
  }

  private setupImageLoad(): void {
    this.loadImagesSkip
      .pipe(
        distinctUntilChanged(),
        filter((skip) => skip > 0),
      )
      .subscribe((skip) => {
        this.loadingImagesSubject.next(true);
        const findImagesDto: FindImagesDto = {
          filter: this.imageFilter,
          randomnessSeed: this.randomnessSeed,
          startingDate: this.startingDate.toISOString(),
          limit: ImageLoaderService.BATCH_SIZE,
          skip,
        };
        this.fetchImages(findImagesDto)
          .pipe(finalize(() => this.loadingImagesSubject.next(false)))
          .subscribe((response) => this.imagesSubject.next(this.imagesSubject.value.concat(...response.images)));
      });
  }
}
