import { Component, effect, OnInit, Signal } from '@angular/core';
import { CollectionsService } from '@app/shared/services/collections.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { CollectionResponse } from '@app/gen/ogm-backend';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'ogm-collection-select',
  imports: [MatFormField, MatSelect, MatLabel, ReactiveFormsModule, MatOption],
  templateUrl: './collection-select.component.html',
  styleUrl: './collection-select.component.scss',
})
export class CollectionSelectComponent implements OnInit {
  collections: Signal<CollectionResponse[]>;

  selectionControl = new FormControl<CollectionResponse>(undefined);

  constructor(private readonly collectionsService: CollectionsService) {
    effect(() =>
      this.selectionControl.setValue(
        this.collectionsService.collections().find((collection) => collection.id === this.collectionsService.selectedCollectionId()),
      ),
    );
  }

  ngOnInit(): void {
    this.collections = this.collectionsService.collections;

    this.selectionControl.valueChanges.subscribe((selection) => this.collectionsService.changeSelectedCollectionId(selection.id));
  }
}
