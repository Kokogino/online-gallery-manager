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
  { path: '**', redirectTo: 'images' },
];
