import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { filter, finalize, of, Subject, tap } from 'rxjs';
import { HttpCacheOptions } from '@app/shared/model/http-cache-options';
import { HttpCacheEntry, RequestType, ResponseType } from '@app/shared/model/http-cache-entry';

const requests = new Map<string, HttpCacheEntry>();

export const httpCacheInterceptor = (options?: HttpCacheOptions): HttpInterceptorFn => {
  const urlsNotToCache = options?.urlsNotToCache ?? [];
  return (req, next) => {
    const skipCache = urlsNotToCache.some((urlRegex) => new RegExp(urlRegex).test(req.url));

    const key = getUniqueKey(req);
    const prevRequest = () => requests.get(key);

    if (!skipCache) {
      const prevReq = prevRequest();

      if (prevReq) {
        if (!prevReq.data$.closed) {
          return prevReq.data$;
        }

        if (prevReq.data && prevReq.ttl > new Date().getTime()) {
          return of(prevReq.data);
        }

        prevReq.data$ = new Subject<ResponseType>();
      } else {
        requests.set(key, {
          data$: new Subject<HttpResponse<ResponseType>>(),
          data: new HttpResponse<ResponseType>(),
          ttl: getTTL(req.url, options),
        });
      }
    }

    return next(req).pipe(
      filter((x) => x instanceof HttpResponse),
      tap((x) => {
        const data = x as HttpResponse<ResponseType>;
        const r = prevRequest();
        if (!r) {
          return;
        }

        r.data = data;
        r.ttl = getTTL(req.url, options);
        if (!r.data$.closed) {
          r.data$.next(data);
        }
      }),
      finalize(() => {
        const r = prevRequest();
        r?.data$.complete();
        r?.data$.unsubscribe();
      }),
    );
  };
};

function getUniqueKey(req: HttpRequest<unknown>): string {
  const bodySorted = sortObjectByKeys(req.body);
  return `${req.method}_${req.url}_${req.params.toString()}_${JSON.stringify(bodySorted)}`;
}

function sortObjectByKeys(obj: RequestType): RequestType {
  const keysSorted = Object.keys(obj ?? '').sort();
  return keysSorted.reduce((_obj, key) => {
    const val = obj[key];
    _obj[key] = typeof val === 'object' ? sortObjectByKeys(val) : val;

    return _obj;
  }, {} as RequestType);
}

function getTTL(reqUrl: string, options?: HttpCacheOptions): number {
  const { ttls, globalTTL } = options ?? {};

  const getCustomTTL = () => {
    const matchedKey = Object.keys(ttls ?? '').find((x) => reqUrl.split('?')[0].endsWith(x));

    if (!ttls || !matchedKey) {
      return null;
    }

    return ttls[matchedKey];
  };

  return new Date().getTime() + (getCustomTTL() ?? globalTTL ?? 0);
}
