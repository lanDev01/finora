import { Component, inject, input, output } from '@angular/core';
import { BUTTON_CONFIG, ButtonConfig } from './button.token';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
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
export class Button {
  protected config = inject(BUTTON_CONFIG);

  size = input<ButtonConfig['size']>(this.config.size ?? 'md');
  variant = input<ButtonConfig['variant']>(this.config.variant ?? 'primary');
  loading = input<boolean>(this.config.loading ?? false);
  disabled = input<boolean>(this.config.disabled ?? false);
  fullWidth = input<boolean>(this.config.fullWidth ?? false);
  type = input<'button' | 'submit' | 'reset'>('button');

  clicked = output<MouseEvent>();

  protected onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
