import { Component, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';
import { BUTTON_CONFIG, ButtonConfig } from '../button/button.token';

@Component({
  selector: 'app-button-dropdown',
  imports: [LucideAngularModule],
  templateUrl: './button-dropdown.html',
  styleUrls: ['../button/button.scss', './button-dropdown.scss'],
  host: {
    '[class.size-sm]': 'size() === "sm"',
    '[class.size-md]': 'size() === "md"',
    '[class.size-lg]': 'size() === "lg"',
    '[class.variant-primary]': 'variant() === "primary"',
    '[class.variant-secondary]': 'variant() === "secondary"',
    '[class.variant-ghost]': 'variant() === "ghost"',
    '[class.variant-destructive]': 'variant() === "destructive"',
    '[class.variant-outline]': 'variant() === "outline"',
    '[class.is-loading]': 'loading()',
    '[class.is-disabled]': 'disabled() || loading()',
    '[class.full-width]': 'fullWidth()',
  },
})
export class ButtonDropdown {
  private readonly el = inject(ElementRef<HTMLElement>);
  protected readonly config = inject(BUTTON_CONFIG);

  protected readonly chevronIcon = ChevronDown;

  size = input<ButtonConfig['size']>(this.config.size ?? 'md');
  variant = input<ButtonConfig['variant']>(this.config.variant ?? 'primary');
  loading = input<boolean>(this.config.loading ?? false);
  disabled = input<boolean>(this.config.disabled ?? false);
  fullWidth = input<boolean>(this.config.fullWidth ?? false);

  openChange = output<boolean>();

  triggerClick = output<MouseEvent>();

  protected readonly open = signal(false);

  protected onTriggerClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) return;
    this.triggerClick.emit(event);
    this.open.update((v) => !v);
    this.openChange.emit(this.open());
  }

  protected onPanelClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('button, a, [role="menuitem"]')) {
      this.open.set(false);
      this.openChange.emit(false);
    }
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    if (this.el.nativeElement.contains(event.target as Node)) return;
    this.open.set(false);
    this.openChange.emit(false);
  }

  @HostListener('document:keydown', ['$event'])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.open()) return;
    this.open.set(false);
    this.openChange.emit(false);
  }
}
