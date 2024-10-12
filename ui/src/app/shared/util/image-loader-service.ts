import { forkJoin, Observable, of, switchMap, take, tap } from 'rxjs';
import { ImageResponse, ImageService, UpdateImageDto } from '@app/gen/ogm-backend';

export abstract class ImageLoaderService {
  abstract get images$(): Observable<ImageResponse[]>;

  abstract get loadingImages$(): Observable<boolean>;

  abstract loadMoreImages(): void;

  abstract updateImages(updatedImages: ImageResponse[]): void;

  constructor(protected readonly imageService: ImageService) {}

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
}
