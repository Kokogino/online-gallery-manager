import { Observable } from 'rxjs';
import { ImageResponse } from '@app/gen/ogm-backend';

export interface ImageLoaderService {
  get images$(): Observable<ImageResponse[]>;

  get loadingImages$(): Observable<boolean>;

  loadMoreImages(): void;
}
