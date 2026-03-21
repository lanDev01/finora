import { Component, inject, type OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';

@Component({
  standalone: true,
  template: `<p>Autenticando...</p>`,
})
export class OAuthCallback implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;

    const token = params.get('token');

    if (!token) {
      this.router.navigate(['/auth/sign-in']);
      return;
    }

    localStorage.setItem('access_token', token);

    this.userService.loadProfile().subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => {
        localStorage.removeItem('access_token');
        this.router.navigate(['/auth/sign-in']);
      },
    });
  }
}
