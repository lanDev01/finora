import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  signIn(data: { email: string; password: string }) {
    return of({ token: 'fake-token' });
  }

  signUp(data: { name: string; email: string; password: string }) {
    return of({ token: 'fake-token' });
  }
}
