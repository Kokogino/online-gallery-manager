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
  startWith,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import {
  FindImagesDto,
  FindImagesResponse,
  GalleryMetadataType,
  GalleryResponse,
  GalleryService,
  ImageService,
  UpdateGalleryDto,
} from '@app/gen/ogm-backend';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { GalleryFilterForm } from '@app/galleries/model/gallery-filter-form';
import { ImageLoaderService } from '@app/shared/util/image-loader-service';
import { containsStringsIgnoringAccentsAndCase } from '@app/shared/util/string-compare';
import { some } from 'lodash-es';
import moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class GalleriesService extends ImageLoaderService {
  public static readonly GALLERY_ID_PARAM = 'gallery';
  public static readonly IMAGE_ID_PARAM = 'image';

  public galleriesFilterForm: FormGroup<GalleryFilterForm>;
  public gallerySearchControl: FormControl<string>;

  private loadingGalleriesSubject = new BehaviorSubject<boolean>(false);
  private loadingGallerySubject = new BehaviorSubject<boolean>(false);
  private deletingGalleryIdSubject = new BehaviorSubject<number>(undefined);

  private galleriesSubject = new BehaviorSubject<GalleryResponse[]>(undefined);
  private selectedGalleryIdSubject = new BehaviorSubject<number>(undefined);
  private selectedGallerySubject = new BehaviorSubject<GalleryResponse>(undefined);

  private findImagesOnGalleryChangeSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly galleryService: GalleryService,
    protected override readonly formBuilder: FormBuilder,
    protected override readonly imageService: ImageService,
    protected override readonly snackBar: MatSnackBar,
    protected override readonly router: Router,
  ) {
    super(imageService, formBuilder, snackBar, router);
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

  get deletingGalleryId$(): Observable<number> {
    return this.deletingGalleryIdSubject.asObservable();
  }

  get filteredGalleries$(): Observable<GalleryResponse[]> {
    return combineLatest([
      this.galleriesSubject.asObservable(),
      this.gallerySearchControl.valueChanges.pipe(startWith(this.gallerySearchControl.value)),
    ]).pipe(
      map(([galleries, filterValue]) =>
        galleries?.filter(
          (gallery) =>
            containsStringsIgnoringAccentsAndCase(gallery.name, filterValue) ||
            some(
              gallery.metadata?.map((metadata) =>
                metadata.type === GalleryMetadataType.Date ? moment(metadata.value).format('DD.MM.YYYY') : metadata.value,
              ),
              (metadata) => containsStringsIgnoringAccentsAndCase(metadata, filterValue),
            ),
        ),
      ),
    );
  }

  get selectedGallery$(): Observable<GalleryResponse> {
    return this.selectedGallerySubject.asObservable();
  }

  get selectedGalleryId$(): Observable<number> {
    return this.selectedGalleryIdSubject.asObservable();
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
      .findGalleries({ ...this.galleriesFilterForm.getRawValue(), startingDate: new Date().toISOString() })
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

  deleteSelectedGallery(): void {
    const selectedGalleryId = this.selectedGalleryIdSubject.value;
    this.deletingGalleryIdSubject.next(selectedGalleryId);
    this.galleryService
      .deleteGalleryById(selectedGalleryId)
      .pipe(
        finalize(() => this.deletingGalleryIdSubject.next(undefined)),
        tap(() => {
          const galleries = this.galleriesSubject.value;
          const index = galleries.findIndex((gallery) => gallery.id === selectedGalleryId);
          galleries.splice(index, 1);
          this.galleriesSubject.next(galleries);
        }),
      )
      .subscribe({
        next: () => {
          if (this.selectedGalleryIdSubject.value === selectedGalleryId) {
            this.selectedGalleryIdSubject.next(undefined);
            void this.router.navigateByUrl('galleries');
          }
        },
        error: () => this.snackBar.open('Error occurred when deleting gallery', 'Dismiss'),
      });
  }

  override fetchImages(findImagesDto: FindImagesDto): Observable<FindImagesResponse> {
    return this.galleryService.findImagesOfGallery(this.selectedGalleryIdSubject.value, findImagesDto);
  }

  override basePath(): string {
    return `galleries/${this.selectedGalleryIdSubject.value}`;
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

    this.gallerySearchControl = new FormControl<string>('');
  }

  private loadImagesOnGalleryChange(): void {
    combineLatest([this.selectedGalleryIdSubject, this.findImagesOnGalleryChangeSubject])
      .pipe(
        filter(([id, shouldFind]) => Boolean(id) && shouldFind),
        map(([id, _]) => id),
        distinctUntilChanged((prevId, currentId) => prevId === currentId),
      )
      .subscribe(() => this.findImages());
  }
}
