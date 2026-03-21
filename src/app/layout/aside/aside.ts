import type { ModalRef } from '@/shared/modal/modal.service';
import { Component, input, type OnInit, output, signal } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

export type AsideSide = 'left' | 'right';

@Component({
  selector: 'app-aside',
  imports: [LucideAngularModule],
  templateUrl: './aside.html',
  styleUrl: './aside.scss',
})
export class Aside implements OnInit {
  title = input<string>('');
  subtitle = input<string>('');
  side = input<AsideSide>('right');

  closed = output<void>();

  /** Injected by ModalService */
  __modalRef?: ModalRef;

  protected readonly xIcon = X;
  protected visible = signal(false);

  ngOnInit(): void {
    requestAnimationFrame(() => {
      this.visible.set(true);
    });
  }

  protected onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('aside-overlay')) {
      this.onClose();
    }
  }

  protected onClose(): void {
    this.visible.set(false);
    this.closed.emit();
    this.__modalRef?.close();
  }
}
