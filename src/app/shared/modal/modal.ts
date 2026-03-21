import { Component, input, type OnInit, output, signal } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-modal',
  imports: [LucideAngularModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal implements OnInit {
  title = input<string>('');
  subtitle = input<string>('');

  closed = output<void>();

  protected readonly xIcon = X;
  protected visible = signal(false);

  ngOnInit(): void {
    requestAnimationFrame(() => {
      this.visible.set(true);
    });
  }

  protected onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closed.emit();
    }
  }

  protected onClose(): void {
    this.closed.emit();
  }
}
