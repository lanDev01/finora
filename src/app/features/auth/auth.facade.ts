import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private service = inject(AuthService);

  signIn(data: { email: string; password: string }) {
    return this.service.signIn(data);
  }

  signUp(data: { name: string; email: string; password: string }) {
    return this.service.signUp(data);
  }
}
