import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import {
  FilterExpressionDto,
  FindImagesDto,
  GalleryResponse,
  GalleryService,
  ImageResponse,
  ImageService,
  UpdateGalleryDto,
} from '@app/gen/ogm-backend';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GalleryFilterForm } from '@app/galleries/model/gallery-filter-form';
import { GalleryImagesFilterForm } from '@app/galleries/model/gallery-images-filter-form';
import { random } from 'lodash-es';
import { ImageLoaderService } from '@app/shared/util/image-loader-service';

@Injectable({
  providedIn: 'root',
})
export class GalleriesService extends ImageLoaderService {
  public static readonly GALLERY_ID_PARAM = 'gallery';
  public static readonly IMAGE_ID_PARAM = 'image';

  public galleriesFilterForm: FormGroup<GalleryFilterForm>;
  public galleryImagesFilterForm: FormGroup<GalleryImagesFilterForm>;

  private loadingGalleriesSubject = new BehaviorSubject<boolean>(false);
  private loadingGallerySubject = new BehaviorSubject<boolean>(false);
  private loadingImagesSubject = new BehaviorSubject<boolean>(false);

  private galleriesSubject = new BehaviorSubject<GalleryResponse[]>(undefined);
  private selectedGalleryIdSubject = new BehaviorSubject<number>(undefined);
  private selectedGallerySubject = new BehaviorSubject<GalleryResponse>(undefined);

  private galleryImagesSubject = new BehaviorSubject<ImageResponse[]>(undefined);
  private findImagesOnGalleryChangeSubject = new BehaviorSubject<boolean>(false);

  private loadImagesSkip = new BehaviorSubject<number>(undefined);
  private imageFilter: FilterExpressionDto;
  private randomnessSeed: number;
  private totalImagesCount: number;

  constructor(
    private readonly galleryService: GalleryService,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    protected override readonly imageService: ImageService,
  ) {
    super(imageService);
    this.fetchGalleryOnIdChange();
    this.initForms();
    this.loadImagesOnGalleryChange();
    this.findGalleries();
  }

  get loadingGalleries$(): Observable<boolean> {
    return this.loadingGalleriesSubject.asObservable();
  }

  get loadingGallery$(): Observable<boolean> {
    return this.loadingGallerySubject.asObservable();
  }

  get loadingImages$(): Observable<boolean> {
    return this.loadingImagesSubject.asObservable();
  }

  get galleries$(): Observable<GalleryResponse[]> {
    return this.galleriesSubject.asObservable();
  }

  get selectedGallery$(): Observable<GalleryResponse> {
    return this.selectedGallerySubject.asObservable();
  }

  get selectedGalleryId$(): Observable<number> {
    return this.selectedGalleryIdSubject.asObservable();
  }

  get images$(): Observable<ImageResponse[]> {
    return this.galleryImagesSubject.asObservable();
  }

  set findImagesOnGalleryChange(shouldFind: boolean) {
    this.findImagesOnGalleryChangeSubject.next(shouldFind);
  }

  changeSelectedGalleryId(newId: number): void {
    this.selectedGalleryIdSubject.next(newId);
  }

  getSelectedGalleryIdValue(): number {
    return this.selectedGalleryIdSubject.value;
  }

  findGalleries(): void {
    this.loadingGalleriesSubject.next(true);
    this.galleryService
      .findGalleries(this.galleriesFilterForm.getRawValue())
      .pipe(finalize(() => this.loadingGalleriesSubject.next(false)))
      .subscribe((galleries) => this.galleriesSubject.next(galleries));
  }

  updateGalleryDetails(updateGalleryDto: UpdateGalleryDto): void {
    const oldGallery = this.selectedGallerySubject.value;
    this.galleryService.updateGallery(oldGallery.id, updateGalleryDto).subscribe((newGallery) => {
      this.selectedGallerySubject.next(newGallery);
      const galleries = this.galleriesSubject.value;
      const index = galleries.findIndex((gallery) => gallery.id === oldGallery.id);
      if (index >= 0) {
        galleries.splice(index, 1, newGallery);
        this.galleriesSubject.next(galleries);
      }
    });
  }

  findImages(): void {
    this.loadingImagesSubject.next(true);
    const formValues = this.galleryImagesFilterForm.getRawValue();
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
    this.galleryImagesSubject.next(undefined);
    this.galleryService
      .findImagesOfGallery(this.selectedGalleryIdSubject.value, findImagesDto)
      .pipe(finalize(() => this.loadingImagesSubject.next(false)))
      .subscribe((response) => {
        this.galleryImagesSubject.next(response.images);
        this.totalImagesCount = response.totalCount;
      });
  }

  loadMoreImages(): void {
    const images = this.galleryImagesSubject.value;
    if (this.totalImagesCount <= images.length) {
      return;
    }
    this.loadImagesSkip.next(images.length);
  }

  updateImage(updatedImage: ImageResponse): void {
    const images = this.galleryImagesSubject.value;
    const index = images.findIndex((image) => image.id === updatedImage.id);
    if (index >= 0) {
      if (updatedImage.galleryId !== this.selectedGalleryIdSubject.value) {
        images.splice(index, 1);
      } else {
        images.splice(index, 1, updatedImage);
      }
      this.galleryImagesSubject.next(images);
    }
  }

  updateImages(updatedImages: ImageResponse[]): void {
    const images = this.galleryImagesSubject.value;
    for (let updatedImage of updatedImages) {
      const index = images.findIndex((image) => image.id === updatedImage.id);
      if (index >= 0) {
        if (updatedImage.galleryId !== this.selectedGalleryIdSubject.value) {
          images.splice(index, 1);
        } else {
          images.splice(index, 1, updatedImage);
        }
      }
    }
    this.galleryImagesSubject.next(images);
  }

  private fetchGalleryOnIdChange(): void {
    this.selectedGalleryIdSubject
      .pipe(
        distinctUntilChanged(),
        tap(() => this.loadingGallerySubject.next(true)),
        switchMap((id) => {
          if (id !== undefined) {
            return this.galleryService.getGalleryById(id).pipe(
              catchError((err) => {
                if (err.error?.errorCode === 6502) {
                  this.selectedGalleryIdSubject.next(undefined);
                  void this.router.navigateByUrl('galleries');
                }
                return throwError(() => err);
              }),
            );
          }
          return of(undefined);
        }),
        tap(() => this.loadingGallerySubject.next(false)),
      )
      .subscribe((gallery) => this.selectedGallerySubject.next(gallery));
  }

  private initForms(): void {
    this.galleriesFilterForm = this.formBuilder.group({
      filter: [],
      randomizeOrder: [false],
    });

    this.galleryImagesFilterForm = this.formBuilder.group({
      filter: [],
      randomizeOrder: [false],
    });
  }

  private loadImagesOnGalleryChange(): void {
    combineLatest([this.selectedGalleryIdSubject, this.findImagesOnGalleryChangeSubject])
      .pipe(
        filter(([id, shouldFind]) => Boolean(id) && shouldFind),
        map(([id, _]) => id),
        distinctUntilChanged((prevId, currentId) => prevId === currentId),
      )
      .subscribe(() => this.findImages());

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
        this.galleryService
          .findImagesOfGallery(this.selectedGalleryIdSubject.value, findImagesDto)
          .pipe(finalize(() => this.loadingImagesSubject.next(false)))
          .subscribe((response) => this.galleryImagesSubject.next(this.galleryImagesSubject.value.concat(...response.images)));
      });
  }
}
