import { Injectable, Signal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  private _selectedCollectionId = signal<number>(1);

  get selectedCollectionId(): Signal<number> {
    return this._selectedCollectionId;
  }
}
