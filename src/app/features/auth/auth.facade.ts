import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap, switchMap } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private service = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  signIn(data: { email: string; password: string }) {
    return this.service.signIn(data).pipe(
      tap((res) => localStorage.setItem('access_token', res.accessToken)),
      switchMap(() => this.userService.loadProfile()),
      tap(() => this.router.navigate(['/home'])),
    );
  }

  signUp(data: { name: string; email: string; password: string }) {
    return this.service.signUp(data).pipe(
      tap((res) => localStorage.setItem('access_token', res.accessToken)),
      switchMap(() => this.userService.loadProfile()),
      tap(() => this.router.navigate(['/home'])),
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.userService.clearUser();
    this.router.navigate(['/auth/sign-in']);
  }
}
