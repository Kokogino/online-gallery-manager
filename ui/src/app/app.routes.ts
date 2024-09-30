import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'upload',
    loadChildren: () => import('./upload/upload.routes'),
  },
  { path: '**', redirectTo: 'images' },
];
