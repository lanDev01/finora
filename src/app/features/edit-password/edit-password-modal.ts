import { UserService } from '@/core/services/user.service';
import { Modal } from '@/shared/modal/modal';
import type { ModalRef } from '@/shared/modal/modal.service';
import { ToastService } from '@/shared/toast/toast.service';
import { Component, computed, inject } from '@angular/core';
import {
  type AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import { INPUT_CONFIG } from '@ui/input/input.token';
import { Password } from '@ui/password/password';
import { Info, LucideAngularModule } from 'lucide-angular';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return newPassword && confirmPassword && newPassword !== confirmPassword
    ? { passwordMismatch: true }
    : null;
}

@Component({
  selector: 'app-edit-password-modal',
  imports: [Modal, ReactiveFormsModule, Password, Button, LucideAngularModule],
  templateUrl: './edit-password-modal.html',
  styleUrls: ['./edit-password-modal.scss'],
  providers: [
    { provide: BUTTON_CONFIG, useValue: { size: 'md', variant: 'primary' } },
    { provide: INPUT_CONFIG, useValue: { size: 'md', variant: 'default' } },
  ],
})
export class EditPasswordModal {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  /** Injected by ModalService */
  __modalRef!: ModalRef<boolean | undefined>;

  protected readonly infoIcon = Info;

  saving = false;

  readonly isSocialUser = computed(() => {
    const user = this.userService.currentUser();
    return !!user?.provider && user.provider !== 'local';
  });

  form = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  get passwordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') && !!this.form.get('confirmPassword')?.dirty;
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const { currentPassword, newPassword } = this.form.getRawValue();

    this.userService
      .updatePassword({
        currentPassword: currentPassword ?? '',
        newPassword: newPassword ?? '',
      })
      .subscribe({
        next: () => {
          this.toast.success('Senha atualizada com sucesso!');
          this.__modalRef.close(true);
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Não foi possível atualizar a senha.';
          this.toast.error(message);
          this.saving = false;
        },
      });
  }

  onClose(): void {
    this.__modalRef.close(undefined);
  }
}
