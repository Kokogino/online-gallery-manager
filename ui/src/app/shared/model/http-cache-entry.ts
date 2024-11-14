import { HttpResponse } from '@angular/common/http';
import { Subject } from 'rxjs';

export interface HttpCacheEntry {
  data: HttpResponse<ResponseType>;
  data$: Subject<HttpResponse<ResponseType>>;
  ttl: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResponseType = any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequestType = any;
