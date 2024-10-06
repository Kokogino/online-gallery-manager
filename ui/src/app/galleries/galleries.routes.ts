import { Routes } from '@angular/router';
import { GalleriesComponent } from '@app/galleries/galleries.component';
import { GalleriesViewComponent } from '@app/galleries/components/galleries-view/galleries-view.component';
import { GalleriesService } from '@app/galleries/services/galleries.service';
import { GalleryComponent } from '@app/galleries/components/gallery/gallery.component';
import { GalleryDetailsComponent } from '@app/galleries/components/gallery-details/gallery-details.component';
import { GalleryImageComponent } from '@app/galleries/components/gallery-image/gallery-image.component';

export const routes: Routes = [
  {
    path: '',
    component: GalleriesComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: GalleriesViewComponent,
      },
      {
        path: `:${GalleriesService.GALLERY_ID_PARAM}`,
        component: GalleryComponent,
        children: [
          {
            path: '',
            pathMatch: 'full',
            component: GalleryDetailsComponent,
          },
          {
            path: `:${GalleriesService.IMAGE_ID_PARAM}`,
            component: GalleryImageComponent,
          },
        ],
      },
    ],
  },
];

export default routes;
