import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[ogmFlexResizer]',
})
export class FlexResizerDirective {
  constructor(public readonly element: ElementRef) {}
}
