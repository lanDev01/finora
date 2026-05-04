import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
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
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly config = inject(BUTTON_CONFIG);

  protected readonly chevronIcon = ChevronDown;

  size = input<ButtonConfig['size']>(this.config.size ?? 'md');
  variant = input<ButtonConfig['variant']>(this.config.variant ?? 'primary');
  loading = input<boolean>(this.config.loading ?? false);
  disabled = input<boolean>(this.config.disabled ?? false);
  fullWidth = input<boolean>(this.config.fullWidth ?? false);

  showChevron = input<boolean>(true);
  triggerAriaLabel = input<string | undefined>(undefined);

  panelMode = input<'inline' | 'overlay'>('inline');

  openChange = output<boolean>();

  triggerClick = output<MouseEvent>();

  protected readonly open = signal(false);
  protected readonly overlayTop = signal(0);
  protected readonly overlayLeft = signal(0);
  protected readonly overlayMinWidth = signal(0);

  constructor() {
    const win = this.doc.defaultView;
    if (!win) return;

    const onScrollClose = () => {
      if (this.open() && this.panelMode() === 'overlay') {
        this.open.set(false);
        this.openChange.emit(false);
      }
    };

    const onResizeReposition = () => {
      if (this.open() && this.panelMode() === 'overlay') {
        this.syncOverlayPosition();
      }
    };

    win.addEventListener('scroll', onScrollClose, true);
    win.addEventListener('resize', onResizeReposition);
    this.destroyRef.onDestroy(() => {
      win.removeEventListener('scroll', onScrollClose, true);
      win.removeEventListener('resize', onResizeReposition);
    });
  }

  protected onTriggerClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) return;
    this.triggerClick.emit(event);
    this.open.update((v) => !v);
    const nowOpen = this.open();
    this.openChange.emit(nowOpen);

    if (nowOpen && this.panelMode() === 'overlay') {
      const btn = this.el.nativeElement.querySelector('.button') as HTMLElement | null;
      if (btn) {
        const r = btn.getBoundingClientRect();
        const win = this.doc.defaultView;
        const vw = win?.innerWidth ?? 0;
        const margin = ButtonDropdown.VIEWPORT_MARGIN;
        const cappedMin =
          vw > 0
            ? Math.min(Math.max(r.width, 176), Math.max(0, vw - 2 * margin))
            : Math.max(r.width, 176);
        this.overlayMinWidth.set(cappedMin);
        this.overlayTop.set(r.bottom + 4);
        this.overlayLeft.set(r.left);
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => this.syncOverlayPosition());
      });
    }
  }

  private static readonly VIEWPORT_MARGIN = 8;

  private syncOverlayPosition(): void {
    if (this.panelMode() !== 'overlay' || !this.open()) return;
    const win = this.doc.defaultView;
    if (!win) return;

    const btn = this.el.nativeElement.querySelector('.button') as HTMLElement | null;
    const panel = this.el.nativeElement.querySelector('.panel') as HTMLElement | null;
    if (!btn || !panel) return;

    const m = ButtonDropdown.VIEWPORT_MARGIN;
    const vw = win.innerWidth;
    const vh = win.innerHeight;

    const r = btn.getBoundingClientRect();
    const gap = 4;
    const minW = Math.min(Math.max(r.width, 176), Math.max(0, vw - 2 * m));

    const pr = panel.getBoundingClientRect();
    const pw = Math.max(pr.width, minW);
    const ph = pr.height;

    let top = r.bottom + gap;
    if (ph > 0 && top + ph > vh - m) {
      top = r.top - gap - ph;
    }
    const maxTop = Math.max(m, vh - m - ph);
    top = Math.min(Math.max(m, top), maxTop);

    let left = r.left;
    if (left + pw > vw - m) {
      left = r.right - pw;
    }
    const maxLeft = Math.max(m, vw - m - pw);
    left = Math.min(Math.max(m, left), maxLeft);

    this.overlayTop.set(top);
    this.overlayLeft.set(left);
    this.overlayMinWidth.set(minW);
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
