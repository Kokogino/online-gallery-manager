import { Component, ViewChild } from '@angular/core';
import { DefaultControlValueAccessor } from '@app/shared/util/default-control-value-accessor.directive';
import { ImageHost } from '@app/gen/ogm-backend';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect, MatSelectTrigger } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'ogm-image-host-input',
  imports: [MatFormField, MatSelect, MatOption, MatLabel, MatSelectTrigger, ReactiveFormsModule],
  templateUrl: './image-host-input.component.html',
  styleUrl: './image-host-input.component.scss',
})
export class ImageHostInputComponent extends DefaultControlValueAccessor<ImageHost> {
  @ViewChild(MatSelect)
  formFieldControl: MatSelect;

  hosts = Object.values(ImageHost);

  getHostName(host: ImageHost): string {
    switch (host) {
      case ImageHost.Imgbox:
        return 'imgbox';
      default:
        throw new Error('Invalid Image Host');
    }
  }

  getHostIcon(host: ImageHost): string {
    switch (host) {
      case ImageHost.Imgbox:
        return 'https://imgbox.com/images/favicon.ico';
    }
  }
}
