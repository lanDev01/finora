import { Component, inject, type OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  template: `<p>Autenticando...</p>`,
})
export class OAuthCallback implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;

    const token = params.get('token');
    const email = params.get('email');

    if (!token) {
      this.router.navigate(['/auth/sign-in']);
      return;
    }

    localStorage.setItem('access_token', token);

    if (email) {
      localStorage.setItem('user_email', email);
    }

    this.router.navigate(['/']);
  }
}
