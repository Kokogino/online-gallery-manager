import { Injectable } from '@angular/core';
import { ImageLoaderService } from '@app/shared/util/image-loader-service';
import { FindImagesDto, FindImagesResponse, ImageService } from '@app/gen/ogm-backend';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

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
  ) {
    super(imageService, formBuilder, snackBar, router);
    this.findImages();
  }

  override fetchImages(findImagesDto: FindImagesDto): Observable<FindImagesResponse> {
    return this.imageService.findImages(findImagesDto);
  }

  override basePath(): string {
    return 'images';
  }
}
