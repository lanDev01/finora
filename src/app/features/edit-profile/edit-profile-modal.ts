import { UserService } from '@/core/services/user.service';
import { Modal } from '@/shared/modal/modal';
import type { ModalRef } from '@/shared/modal/modal.service';
import { Component, inject, type OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import { INPUT_CONFIG } from '@ui/input/input.token';
import { Textbox } from '@ui/textbox/textbox';
import { Camera, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-edit-profile-modal',
  imports: [Modal, ReactiveFormsModule, Textbox, Button, LucideAngularModule],
  templateUrl: './edit-profile-modal.html',
  styleUrl: './edit-profile-modal.scss',
  providers: [
    { provide: BUTTON_CONFIG, useValue: { size: 'md', variant: 'primary' } },
    { provide: INPUT_CONFIG, useValue: { size: 'md', variant: 'default' } },
  ],
})
export class EditProfileModal implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  /** Injected by ModalService */
  __modalRef!: ModalRef<boolean | undefined>;

  protected readonly cameraIcon = Camera;

  saving = false;
  avatarPreview = signal<string | null>(null);
  avatarFile: File | null = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    const user = this.userService.currentUser();
    if (user) {
      this.form.patchValue({ name: user.name });
      this.avatarPreview.set(user.avatar ?? null);
    }
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.avatarFile = file;

    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const name = this.form.getRawValue().name ?? '';

    this.userService.updateProfile({ name, avatarFile: this.avatarFile ?? undefined }).subscribe({
      next: () => this.__modalRef.close(true),
      error: () => {
        this.saving = false;
      },
    });
  }

  onClose(): void {
    this.__modalRef.close(undefined);
  }
}
