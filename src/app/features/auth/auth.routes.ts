import type { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'sign-in',
    loadComponent: () => import('./pages/sign-in/sign-in').then((c) => c.SignIn),
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/sign-up/sign-up').then((c) => c.SignUp),
  },
  {
    path: 'social-callback',
    loadComponent: () =>
      import('./pages/oauth-callback/oauth-callback').then((c) => c.OAuthCallback),
  },
];
