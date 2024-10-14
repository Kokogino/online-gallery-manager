import { BehaviorSubject, distinctUntilChanged, filter, finalize, forkJoin, Observable, of, switchMap, take, tap } from 'rxjs';
import { FilterExpressionDto, FindImagesDto, FindImagesResponse, ImageResponse, ImageService, UpdateImageDto } from '@app/gen/ogm-backend';
import { random } from 'lodash-es';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ImagesFilterForm } from '@app/images/model/images-filter-form';

export abstract class ImageLoaderService {
  private static readonly BATCH_SIZE = 20;

  public imagesFilterForm: FormGroup<ImagesFilterForm>;

  protected loadingImagesSubject = new BehaviorSubject<boolean>(false);
  protected imagesSubject = new BehaviorSubject<ImageResponse[]>(undefined);

  private loadImagesSkip = new BehaviorSubject<number>(undefined);
  private imageFilter: FilterExpressionDto;
  private startingDate: Date;
  private randomnessSeed: number;
  private totalImagesCount: number;

  abstract fetchImages(findImagesDto: FindImagesDto): Observable<FindImagesResponse>;

  constructor(
    protected readonly imageService: ImageService,
    protected readonly formBuilder: FormBuilder,
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

  addTagsToImages(tagIds: number[], imageIds: number[]): Observable<ImageResponse[]> {
    return this.images$.pipe(
      take(1),
      switchMap((images) => {
        const updates: Observable<ImageResponse>[] = [];
        for (let imageId of imageIds) {
          const image = images.find((img) => img.id === imageId);
          const updateImageDto: UpdateImageDto = {
            galleryId: image.galleryId,
            tagIds: [...new Set([...image.tags.map((tag) => tag.tagId), ...tagIds])],
          };
          updates.push(this.imageService.updateImage(image.id, updateImageDto));
        }

        if (updates.length > 0) {
          return forkJoin(updates).pipe(tap((updatedImages) => this.updateImages(updatedImages)));
        }
        return of([]);
      }),
    );
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
