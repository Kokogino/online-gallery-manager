import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GalleriesTitleComponent } from '@app/galleries/components/galleries-title/galleries-title.component';

@Component({
  selector: 'ogm-galleries',
  standalone: true,
  imports: [RouterOutlet, GalleriesTitleComponent],
  templateUrl: './galleries.component.html',
  styleUrl: './galleries.component.scss',
})
export class GalleriesComponent {}
