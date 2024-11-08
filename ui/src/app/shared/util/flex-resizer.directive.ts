import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[ogmFlexResizer]',
  standalone: true,
})
export class FlexResizerDirective {
  constructor(public readonly element: ElementRef) {}
}
