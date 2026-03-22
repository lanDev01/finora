import {
  Component,
  computed,
  input,
  type OnDestroy,
  type OnInit,
  output,
  signal,
} from '@angular/core';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  LucideAngularModule,
  X,
} from 'lucide-angular';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

@Component({
  selector: 'app-toast',
  imports: [LucideAngularModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss'],
})
export class Toast implements OnInit, OnDestroy {
  message = input<string>('');
  type = input<ToastType>('info');
  duration = input<number>(4000);

  closed = output<void>();

  protected readonly xIcon = X;
  protected readonly icon = computed(() => TOAST_ICONS[this.type()]);
  protected visible = signal(false);

  private timer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    requestAnimationFrame(() => this.visible.set(true));

    const duration = this.duration();
    if (duration > 0) {
      this.timer = setTimeout(() => this.dismiss(), duration);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  protected dismiss(): void {
    if (this.timer) clearTimeout(this.timer);
    this.visible.set(false);
    setTimeout(() => this.closed.emit(), 220);
  }
}
