import { Injectable, Signal, signal } from '@angular/core';
import { parseInt } from 'lodash-es';
import { CollectionResponse, CollectionService } from '@app/gen/ogm-backend';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  private static readonly COLLECTION_ID_KEY = 'collectionId';

  private storage: Storage = localStorage;

  private _selectedCollectionId = signal<number>(undefined);

  private _collections = signal<CollectionResponse[]>(undefined);

  constructor(private readonly collectionService: CollectionService) {}

  get selectedCollectionId(): Signal<number> {
    return this._selectedCollectionId;
  }

  get collections(): Signal<CollectionResponse[]> {
    return this._collections;
  }

  changeSelectedCollectionId(id: number): void {
    this._selectedCollectionId.set(id);
    this.storage.setItem(CollectionsService.COLLECTION_ID_KEY, String(id));
  }

  loadCollections(): Observable<CollectionResponse[]> {
    return this.collectionService.getAllCollections().pipe(
      tap((collections) => {
        this._collections.set(collections);
        const selectedCollectionId = parseInt(this.storage.getItem(CollectionsService.COLLECTION_ID_KEY));
        if (collections.some((collection) => collection.id === selectedCollectionId)) {
          this._selectedCollectionId.set(selectedCollectionId);
        } else {
          // At least one collection must exist at any time
          this.changeSelectedCollectionId(collections[0].id);
        }
      }),
    );
  }
}
