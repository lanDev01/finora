import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  if (!token) {
    router.navigate(['/auth/sign-in']);
    return false;
  }

  return true;
};
