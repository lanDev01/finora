import { Injectable, inject } from '@angular/core';
import { OAuthService } from './oauth.service';

@Injectable({ providedIn: 'root' })
export class OAuthFacade {
  private service = inject(OAuthService);

  loginWithGithub(): void {
    this.service.redirectToProvider('github');
  }

  loginWithGoogle(): void {
    this.service.redirectToProvider('google');
  }
}
