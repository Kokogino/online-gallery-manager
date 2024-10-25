export interface HttpCacheOptions {
  urlsNotToCache?: string[];
  ttls?: { [url: string]: number };
  globalTTL?: number;
}
