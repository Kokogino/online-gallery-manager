import { FormControl } from '@angular/forms';

export interface TagForm {
  tagName: FormControl<string>;
  showTag: FormControl<boolean>;
}
