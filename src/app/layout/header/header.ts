import { ThemeService } from '@/core/services/theme.service';
import { type User, UserService } from '@/core/services/user.service';
import { Avatar } from '@/shared/avatar/avatar';
import { Logo } from '@/shared/logo/logo';
import { ModalService } from '@/shared/modal/modal.service';
import { UserMenuAside } from '@/shared/user-menu-aside/user-menu-aside';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideAngularModule, Moon, Sun } from 'lucide-angular';
import { map, type Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [Logo, Avatar, AsyncPipe, LucideAngularModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private userService = inject(UserService);
  private themeService = inject(ThemeService);
  private modalService = inject(ModalService);

  readonly user$: Observable<User | null> = this.userService.user$;

  readonly userName$ = this.user$.pipe(map((u) => u?.name ?? null));

  readonly userAvatar$ = this.user$.pipe(map((u) => u?.avatar ?? null));

  protected readonly sun = Sun;
  protected readonly moon = Moon;

  get isDark() {
    return this.themeService.isDarkMode();
  }

  get themeIcon() {
    return this.isDark ? this.sun : this.moon;
  }

  get themeLabel() {
    return this.isDark ? 'Ativar modo claro' : 'Ativar modo escuro';
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  openAside() {
    this.modalService.open(UserMenuAside);
  }
}
