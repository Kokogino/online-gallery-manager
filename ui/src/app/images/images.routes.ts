import { Routes } from '@angular/router';
import { ImagesComponent } from '@app/images/images.component';
import { ImagesService } from '@app/images/services/images.service';
import { ImagePageComponent } from '@app/images/components/image-page/image-page.component';

export const routes: Routes = [
  {
    path: '',
    component: ImagesComponent,
    children: [
      {
        path: `:${ImagesService.IMAGE_ID_PARAM}`,
        component: ImagePageComponent,
      },
    ],
  },
];

export default routes;
