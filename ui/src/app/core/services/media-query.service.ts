import { Injectable } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root',
})
export class MediaQueryService {
  private readonly _isMaximumMobileQuery: MediaQueryList;
  private readonly _isMaximumTabletQuery: MediaQueryList;
  private readonly _isMaximumDesktopQuery: MediaQueryList;
  private readonly _isMinimumTabletQuery: MediaQueryList;
  private readonly _isMinimumDesktopQuery: MediaQueryList;

  constructor(private readonly media: MediaMatcher) {
    this._isMaximumMobileQuery = media.matchMedia('(max-width: 424px)');
    this._isMaximumTabletQuery = media.matchMedia('(max-width: 767px)');
    this._isMaximumDesktopQuery = media.matchMedia('(max-width: 1023px)');
    this._isMinimumTabletQuery = media.matchMedia('(min-width: 768px)');
    this._isMinimumDesktopQuery = media.matchMedia('(min-width: 1024px)');
  }

  get isMaximumMobileQuery(): MediaQueryList {
    return this._isMaximumMobileQuery;
  }

  get isMinimumTabletQuery(): MediaQueryList {
    return this._isMinimumTabletQuery;
  }

  get isMaximumDesktopQuery(): MediaQueryList {
    return this._isMaximumDesktopQuery;
  }

  get isMaximumTabletQuery(): MediaQueryList {
    return this._isMaximumTabletQuery;
  }

  get isMinimumDesktopQuery(): MediaQueryList {
    return this._isMinimumDesktopQuery;
  }
}
