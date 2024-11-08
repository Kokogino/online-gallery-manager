import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly COLUMN_WIDTH_KEY = 'columnWidth';

  private storage: Storage = localStorage;

  getColumnWidth(): number {
    return parseInt(this.storage.getItem(this.COLUMN_WIDTH_KEY));
  }

  setColumnWidth(width: number): void {
    this.storage.setItem(this.COLUMN_WIDTH_KEY, String(width));
  }
}
