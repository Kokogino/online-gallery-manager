import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TagGroupSelection } from '@app/shared/model/tag-group-selection';
import { MatInput } from '@angular/material/input';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { DefaultControlValueAccessor } from '@app/shared/util/default-control-value-accessor.directive';
import { isNil } from 'lodash-es';

@Component({
  selector: 'ogm-tag-group-select',
  standalone: true,
  imports: [ReactiveFormsModule, MatInput, MatSlider, MatSliderThumb],
  templateUrl: './tag-group-select.component.html',
  styleUrl: './tag-group-select.component.scss',
})
export class TagGroupSelectComponent extends DefaultControlValueAccessor<TagGroupSelection> implements OnInit {
  sliderControl: FormControl<number>;

  @ViewChild('hiddenInput')
  formFieldControl: MatInput;

  override ngOnInit(): void {
    super.ngOnInit();

    this.sliderControl = new FormControl(this.tagGroupToNumber(this.control.value));

    this.sliderControl.valueChanges.subscribe((tagGroup) => this.control.setValue(this.numberToTagGroup(tagGroup)));
  }

  displayLabel(value: number): string {
    switch (value) {
      case 1:
        return 'Hidden';
      case 2:
        return 'Shown';
      case 3:
        return 'All';
      default:
        return undefined;
    }
  }

  private tagGroupToNumber(tagGroup: TagGroupSelection): number {
    if (isNil(tagGroup)) {
      return undefined;
    }
    switch (tagGroup) {
      case TagGroupSelection.Hidden:
        return 1;
      case TagGroupSelection.Shown:
        return 2;
      case TagGroupSelection.All:
        return 3;
      default:
        throw Error(`Invalid TagGroupSelection: ${tagGroup}`);
    }
  }

  private numberToTagGroup(value: number): TagGroupSelection {
    switch (value) {
      case 1:
        return TagGroupSelection.Hidden;
      case 2:
        return TagGroupSelection.Shown;
      case 3:
        return TagGroupSelection.All;
      default:
        return undefined;
    }
  }
}
