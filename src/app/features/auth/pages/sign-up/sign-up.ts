import { Component, inject } from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  type ValidationErrors,
  type ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BadgePlus, ChevronRight, LucideAngularModule } from 'lucide-angular';
import { Button } from '../../../../ui/button/button';
import { BUTTON_CONFIG } from '../../../../ui/button/button.token';
import { INPUT_CONFIG } from '../../../../ui/input/input.token';
import { Password } from '../../../../ui/password/password';
import { Textbox } from '../../../../ui/textbox/textbox';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  return password && confirmPassword && password.value === confirmPassword.value
    ? null
    : { passwordMismatch: true };
};

@Component({
  selector: 'app-sign-up',
  imports: [Button, LucideAngularModule, ReactiveFormsModule, Password, Textbox],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
  providers: [
    { provide: INPUT_CONFIG, useValue: { size: 'lg' } },
    { provide: BUTTON_CONFIG, useValue: { size: 'lg', variant: 'primary' } },
  ],
})
export class SignUp {
  protected readonly badgePlus = BadgePlus;
  protected readonly chevronRight = ChevronRight;

  private router = inject(Router);

  protected readonly signUpForm = new FormGroup(
    {
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatchValidator },
  );

  actionSubmit() {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      this.signUpForm.updateValueAndValidity({ emitEvent: true });
      return;
    }

    console.log(this.signUpForm.value);
  }

  actionNavigateToSignIn() {
    this.router.navigate(['/auth/sign-in']);
  }
}
