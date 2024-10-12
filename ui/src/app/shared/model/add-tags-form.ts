import { FormControl } from '@angular/forms';
import { TagResponse } from '@app/gen/ogm-backend';

export interface AddTagsForm {
  tags: FormControl<TagResponse[]>;
}
