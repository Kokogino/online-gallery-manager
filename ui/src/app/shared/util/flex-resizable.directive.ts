import { contentChildren, Directive, effect, ElementRef, OnDestroy, output } from '@angular/core';
import { FlexResizerDirective } from '@app/shared/util/flex-resizer.directive';

@Directive({
  selector: '[ogmFlexResizable]',
})
export class FlexResizableDirective implements OnDestroy {
  readonly resizeHorizontal = output<number>();

  readonly resizeVertical = output<number>();

  readonly flexResizers = contentChildren(FlexResizerDirective);

  private previousX: number;
  private previousY: number;

  private resizeEventListener = (e: MouseEvent | TouchEvent) => this.resize(e);
  private startResizingEventListener = (e: MouseEvent | TouchEvent) => this.startResizing(e);
  private stopResizingEventListener = () => this.stopResizing();

  constructor(private element: ElementRef) {
    effect(() =>
      this.flexResizers().forEach((resizer: FlexResizerDirective) => {
        resizer.element.nativeElement.addEventListener('touchstart', this.startResizingEventListener);
        resizer.element.nativeElement.addEventListener('mousedown', this.startResizingEventListener);
      }),
    );
  }

  ngOnDestroy(): void {
    this.stopResizing();
  }

  private stopResizing(): void {
    const htmlElement = document.querySelector('html');
    htmlElement.style.userSelect = 'initial';
    htmlElement.removeEventListener('touchmove', this.resizeEventListener);
    htmlElement.removeEventListener('mousemove', this.resizeEventListener);
    htmlElement.removeEventListener('touchend', this.stopResizingEventListener);
    htmlElement.removeEventListener('touchcancel', this.stopResizingEventListener);
    htmlElement.removeEventListener('mouseup', this.stopResizingEventListener);
  }

  private startResizing(event: MouseEvent | TouchEvent): void {
    this.previousX = this.getClientX(event);
    this.previousY = this.getClientY(event);
    const htmlElement = document.querySelector('html');
    htmlElement.style.userSelect = 'none';
    htmlElement.addEventListener('touchmove', this.resizeEventListener);
    htmlElement.addEventListener('mousemove', this.resizeEventListener);
    htmlElement.addEventListener('touchend', this.stopResizingEventListener);
    htmlElement.addEventListener('touchcancel', this.stopResizingEventListener);
    htmlElement.addEventListener('mouseup', this.stopResizingEventListener);
  }

  private resize(event: MouseEvent | TouchEvent): void {
    const boundingClientRect = this.element.nativeElement.getBoundingClientRect();

    const leftBoundary = boundingClientRect.left;
    const rightBoundary = boundingClientRect.right;
    const cursorX = this.getClientX(event);
    if (cursorX !== this.previousX && this.previousX >= leftBoundary && this.previousX <= rightBoundary) {
      this.resizeHorizontal.emit(cursorX - this.previousX);
    }
    this.previousX = cursorX;

    const topBoundary = boundingClientRect.top;
    const bottomBoundary = boundingClientRect.bottom;
    const cursorY = this.getClientY(event);
    if (cursorY !== this.previousY && this.previousY >= topBoundary && this.previousY <= bottomBoundary) {
      this.resizeVertical.emit(cursorY - this.previousY);
    }
    this.previousY = cursorY;
  }

  private getClientX(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.clientX;
    }
    return event.touches[0].clientX;
  }

  private getClientY(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.clientY;
    }
    return event.touches[0].clientY;
  }
}
