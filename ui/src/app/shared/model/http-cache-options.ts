export interface HttpCacheOptions {
  urlsNotToCache?: string[];
  ttls?: Record<string, number>;
  globalTTL?: number;
}
