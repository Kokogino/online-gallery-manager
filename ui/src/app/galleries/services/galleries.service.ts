import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, distinctUntilChanged, finalize, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { GalleryResponse, GalleryService, UpdateGalleryDto } from '@app/gen/ogm-backend';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GalleryFilterForm } from '@app/shared/model/gallery-filter-form';

@Injectable({
  providedIn: 'root',
})
export class GalleriesService {
  public static readonly GALLERY_ID_PARAM = 'gallery';
  public static readonly IMAGE_ID_PARAM = 'image';

  public galleriesFilterForm: FormGroup<GalleryFilterForm>;

  private loadingGalleriesSubject = new BehaviorSubject<boolean>(false);
  private loadingGallerySubject = new BehaviorSubject<boolean>(false);
  private loadingImagesSubject = new BehaviorSubject<boolean>(false);

  private galleriesSubject = new BehaviorSubject<GalleryResponse[]>(undefined);
  private selectedGalleryIdSubject = new BehaviorSubject<number>(undefined);
  private selectedGallerySubject = new BehaviorSubject<GalleryResponse>(undefined);

  constructor(
    private readonly galleryService: GalleryService,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
  ) {
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

    this.galleriesFilterForm = this.formBuilder.group({
      filter: [],
      randomizeOrder: [false],
    });

    this.findGalleries();
  }

  get loadingGalleries$(): Observable<boolean> {
    return this.loadingGalleriesSubject.asObservable();
  }

  get loadingGallery$(): Observable<boolean> {
    return this.loadingGallerySubject.asObservable();
  }

  get galleries$(): Observable<GalleryResponse[]> {
    return this.galleriesSubject.asObservable();
  }

  get selectedGallery$(): Observable<GalleryResponse> {
    return this.selectedGallerySubject.asObservable();
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
}
