import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root',
})
export class GalleryDetailsSidebarService {
  private _detailsSidebar: MatSidenav;

  set detailsSidebar(sidebar: MatSidenav) {
    this._detailsSidebar = sidebar;
  }

  destroy(): void {
    void this._detailsSidebar?.close();
    this._detailsSidebar = undefined;
  }

  toggle(): void {
    void this._detailsSidebar?.toggle();
  }
}
