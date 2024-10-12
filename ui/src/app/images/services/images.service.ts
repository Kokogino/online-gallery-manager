import { Injectable } from '@angular/core';
import { ImageLoaderService } from '@app/shared/util/image-loader-service';
import { FilterExpressionDto, FindImagesDto, ImageResponse, ImageService } from '@app/gen/ogm-backend';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, distinctUntilChanged, filter, finalize, Observable } from 'rxjs';
import { ImagesFilterForm } from '@app/images/model/images-filter-form';
import { random } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class ImagesService extends ImageLoaderService {
  public static readonly IMAGE_ID_PARAM = 'image';

  public imagesFilterForm: FormGroup<ImagesFilterForm>;

  private loadingImagesSubject = new BehaviorSubject<boolean>(false);
  private imagesSubject = new BehaviorSubject<ImageResponse[]>(undefined);

  private loadImagesSkip = new BehaviorSubject<number>(undefined);
  private imageFilter: FilterExpressionDto;
  private randomnessSeed: number;
  private totalImagesCount: number;

  constructor(
    protected override readonly imageService: ImageService,
    private readonly formBuilder: FormBuilder,
  ) {
    super(imageService);
    this.initForm();
    this.setupImageLoad();
    this.findImages();
  }

  get images$(): Observable<ImageResponse[]> {
    return this.imagesSubject.asObservable();
  }

  get loadingImages$(): Observable<boolean> {
    return this.loadingImagesSubject.asObservable();
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
    const findImagesDto: FindImagesDto = {
      filter: formValues.filter,
      randomnessSeed: this.randomnessSeed,
      limit: 20,
      skip: 0,
    };
    this.loadImagesSkip.next(0);
    this.imagesSubject.next(undefined);
    this.imageService
      .findImages(findImagesDto)
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

  updateImages(updatedImages: ImageResponse[]): void {
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
          limit: 20,
          skip,
        };
        this.imageService
          .findImages(findImagesDto)
          .pipe(finalize(() => this.loadingImagesSubject.next(false)))
          .subscribe((response) => this.imagesSubject.next(this.imagesSubject.value.concat(...response.images)));
      });
  }
}
