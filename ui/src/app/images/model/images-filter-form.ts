import { FormControl } from '@angular/forms';
import { FilterExpressionDto } from '@app/gen/ogm-backend';

export interface ImagesFilterForm {
  filter: FormControl<FilterExpressionDto>;
  randomizeOrder: FormControl<boolean>;
}
