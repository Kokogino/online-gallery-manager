import { Injectable } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MediaQueryService {
  private readonly _isMaximumMobileLayout$: Observable<BreakpointState>;
  private readonly _isMaximumTabletLayout$: Observable<BreakpointState>;
  private readonly _isMaximumDesktopLayout$: Observable<BreakpointState>;
  private readonly _isMinimumTabletLayout$: Observable<BreakpointState>;
  private readonly _isMinimumDesktopLayout$: Observable<BreakpointState>;

  constructor(private readonly breakpointObserver: BreakpointObserver) {
    this._isMaximumMobileLayout$ = this.breakpointObserver.observe('(max-width: 424px)');
    this._isMaximumTabletLayout$ = this.breakpointObserver.observe('(max-width: 767px)');
    this._isMaximumDesktopLayout$ = this.breakpointObserver.observe('(max-width: 1023px)');
    this._isMinimumTabletLayout$ = this.breakpointObserver.observe('(min-width: 768px)');
    this._isMinimumDesktopLayout$ = this.breakpointObserver.observe('(min-width: 1024px)');
  }

  get isMaximumMobileLayout$(): Observable<boolean> {
    return this._isMaximumMobileLayout$.pipe(map((state) => state.matches));
  }

  get isMinimumTabletLayout$(): Observable<boolean> {
    return this._isMinimumTabletLayout$.pipe(map((state) => state.matches));
  }

  get isMaximumDesktopLayout$(): Observable<boolean> {
    return this._isMaximumDesktopLayout$.pipe(map((state) => state.matches));
  }

  get isMaximumTabletLayout$(): Observable<boolean> {
    return this._isMaximumTabletLayout$.pipe(map((state) => state.matches));
  }

  get isMinimumDesktopLayout$(): Observable<boolean> {
    return this._isMinimumDesktopLayout$.pipe(map((state) => state.matches));
  }
}
