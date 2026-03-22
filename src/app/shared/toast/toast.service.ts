import {
  ApplicationRef,
  type ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';
import { Subject } from 'rxjs';
import { Toast, type ToastType } from './toast';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastRef {
  close: () => void;
  afterClosed: () => Subject<void>;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private container: HTMLElement | null = null;

  private getContainer(): HTMLElement {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  show(options: ToastOptions): ToastRef {
    const afterClosedSubject = new Subject<void>();

    const componentRef = createComponent(Toast, {
      environmentInjector: this.injector,
    });

    componentRef.setInput('message', options.message);
    componentRef.setInput('type', options.type ?? 'info');
    if (options.duration !== undefined) {
      componentRef.setInput('duration', options.duration);
    }

    const toastRef: ToastRef = {
      close: () => {
        afterClosedSubject.next();
        afterClosedSubject.complete();
        this.destroyToast(componentRef);
      },
      afterClosed: () => afterClosedSubject,
    };

    componentRef.instance.closed.subscribe(() => this.destroyToast(componentRef));

    this.appRef.attachView(componentRef.hostView);

    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
    this.getContainer().appendChild(domElem);

    return toastRef;
  }

  success(message: string, duration?: number): ToastRef {
    return this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): ToastRef {
    return this.show({ message, type: 'error', duration });
  }

  warning(message: string, duration?: number): ToastRef {
    return this.show({ message, type: 'warning', duration });
  }

  info(message: string, duration?: number): ToastRef {
    return this.show({ message, type: 'info', duration });
  }

  private destroyToast(componentRef: ComponentRef<any>): void {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
    domElem?.parentNode?.removeChild(domElem);
  }
}
