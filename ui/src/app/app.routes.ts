import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'upload',
    loadChildren: () => import('./upload/upload.routes'),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes'),
  },
  {
    path: 'galleries',
    loadChildren: () => import('./galleries/galleries.routes'),
  },
  {
    path: 'images',
    loadChildren: () => import('./images/images.routes'),
  },
  { path: '**', redirectTo: 'images' },
];
