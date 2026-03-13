import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

export type OAuthProvider = 'github' | 'google';

@Injectable({ providedIn: 'root' })
export class OAuthService {
  redirectToProvider(provider: OAuthProvider): void {
    window.location.href = `${environment.apiUrl}/auth/${provider}`;
  }
}
