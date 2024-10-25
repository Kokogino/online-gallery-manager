import { HttpResponse } from '@angular/common/http';
import { Subject } from 'rxjs';

export interface HttpCacheEntry {
  data: HttpResponse<any>;
  data$: Subject<HttpResponse<any>>;
  ttl: number;
}
