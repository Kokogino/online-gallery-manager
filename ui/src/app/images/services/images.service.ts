import { effect, Injectable } from '@angular/core';
import { ImageLoaderService } from '@app/shared/util/image-loader-service';
import { FindImagesDto, FindImagesResponse, ImageService } from '@app/gen/ogm-backend';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CollectionsService } from '@app/shared/services/collections.service';

@Injectable({
  providedIn: 'root',
})
export class ImagesService extends ImageLoaderService {
  public static readonly IMAGE_ID_PARAM = 'image';

  constructor(
    protected override readonly imageService: ImageService,
    protected override readonly formBuilder: FormBuilder,
    protected override readonly snackBar: MatSnackBar,
    protected override readonly router: Router,
    protected override readonly collectionsService: CollectionsService,
  ) {
    super(imageService, formBuilder, snackBar, router, collectionsService);
    effect(() => {
      this.imagesFilterForm.reset({
        filter: null,
        randomizeOrder: false,
      });
      this.findImages();
    });
  }

  override fetchImages(findImagesDto: FindImagesDto): Observable<FindImagesResponse> {
    return this.imageService.findImages(findImagesDto);
  }

  override basePath(): string {
    return 'images';
  }
}
