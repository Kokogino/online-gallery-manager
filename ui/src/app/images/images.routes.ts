import { Routes } from '@angular/router';
import { ImagesComponent } from '@app/images/images.component';
import { ImagesService } from '@app/images/services/images.service';
import { ImageDetailsComponent } from '@app/images/components/image-details/image-details.component';

export const routes: Routes = [
  {
    path: '',
    component: ImagesComponent,
    children: [
      {
        path: `:${ImagesService.IMAGE_ID_PARAM}`,
        component: ImageDetailsComponent,
      },
    ],
  },
];

export default routes;
