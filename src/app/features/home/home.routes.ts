import type { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home').then((c) => c.Home),
    canActivate: [authGuard],
  },
];
