import { Component } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'ogm-deleting-overlay',
  imports: [MatProgressBar],
  templateUrl: './deleting-overlay.component.html',
  styleUrl: './deleting-overlay.component.scss',
})
export class DeletingOverlayComponent {}
