import { UserService } from '@/core/services/user.service';
import { EditPasswordModal } from '@/features/edit-password/edit-password-modal';
import { EditProfileModal } from '@/features/edit-profile/edit-profile-modal';
import { Aside } from '@/layout/aside/aside';
import type { ModalRef } from '@/shared/modal/modal.service';
import { ModalService } from '@/shared/modal/modal.service';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  LucideAngularModule,
  RectangleEllipsis,
  Settings,
  UserPen,
} from 'lucide-angular';

@Component({
  selector: 'app-user-menu-aside',
  imports: [Aside, LucideAngularModule],
  templateUrl: './user-menu-aside.html',
  styleUrl: './user-menu-aside.scss',
})
export class UserMenuAside {
  private router = inject(Router);
  private userService = inject(UserService);
  private modalService = inject(ModalService);

  /** Injected by ModalService */
  __modalRef?: ModalRef;

  protected readonly dashboardIcon = LayoutDashboard;
  protected readonly rectangleEllipsisIcon = RectangleEllipsis;
  protected readonly userPenIcon = UserPen;
  protected readonly settingsIcon = Settings;
  protected readonly logoutIcon = LogOut;

  protected readonly chevronLeftIcon = ChevronLeft;
  protected readonly chevronRightIcon = ChevronRight;

  showSettings = false;

  navigate(path: string): void {
    this.router.navigate([path]);
    this.__modalRef?.close();
  }

  handleEditProfile(): void {
    this.__modalRef?.close();
    this.modalService.open(EditProfileModal);
  }

  handleEditPassword(): void {
    this.__modalRef?.close();
    this.modalService.open(EditPasswordModal);
  }

  handleShowSettings(): void {
    this.showSettings = !this.showSettings;
  }

  logout(): void {
    this.__modalRef?.close();
    this.userService.clearUser();
  }

  onClose(): void {
    this.__modalRef?.close();
  }
}
