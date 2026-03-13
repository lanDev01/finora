import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BadgePlus, ChevronRight, LucideAngularModule } from 'lucide-angular';
import { Button } from '../../../../ui/button/button';
import { BUTTON_CONFIG } from '../../../../ui/button/button.token';
import { INPUT_CONFIG } from '../../../../ui/input/input.token';
import { Password } from '../../../../ui/password/password';
import { Textbox } from '../../../../ui/textbox/textbox';
import { OAuthFacade } from '../../oauth.facade';

@Component({
  selector: 'app-sign-in',
  imports: [Button, LucideAngularModule, ReactiveFormsModule, Password, Textbox],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
  providers: [
    { provide: INPUT_CONFIG, useValue: { size: 'lg' } },
    { provide: BUTTON_CONFIG, useValue: { size: 'lg', variant: 'primary' } },
  ],
})
export class SignIn {
  protected readonly badgePlus = BadgePlus;
  protected readonly chevronRight = ChevronRight;

  private router = inject(Router);
  private oauthFacade = inject(OAuthFacade);

  protected readonly signInForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  actionSubmit() {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      this.signInForm.updateValueAndValidity({ emitEvent: true });
      return;
    }

    console.log(this.signInForm.value);
  }

  actionLoginWithGithub(): void {
    this.oauthFacade.loginWithGithub();
  }

  actionLoginWithGoogle(): void {
    this.oauthFacade.loginWithGoogle();
  }

  actionNavigateToSignUp() {
    this.router.navigate(['/auth/sign-up']);
  }
}
