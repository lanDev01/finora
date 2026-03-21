import {
  ApplicationRef,
  type ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  type Type,
} from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalRef<T = any> {
  /** Closes the modal */
  close: (result?: T) => void;
  /** Observable that emits when the modal is closed */
  afterClosed: () => Subject<T | undefined>;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  /**
   * Opens a modal with the given component.
   * The component must use <app-modal> inside its template.
   * The ModalRef is injected into the component's `__modalRef` property.
   */
  open<C, R = any>(component: Type<C>, data?: Record<string, any>): ModalRef<R> {
    const afterClosedSubject = new Subject<R | undefined>();

    const modalRef: ModalRef<R> = {
      close: (result?: R) => {
        afterClosedSubject.next(result);
        afterClosedSubject.complete();
        this.destroyModal(componentRef);
      },
      afterClosed: () => afterClosedSubject,
    };

    const componentRef = createComponent(component, {
      environmentInjector: this.injector,
      elementInjector: undefined,
    });

    // Set inputs if data is provided
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        componentRef.setInput(key, value);
      }
    }

    // Provide the ModalRef to the component instance
    (componentRef.instance as any).__modalRef = modalRef;

    this.appRef.attachView(componentRef.hostView);

    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    return modalRef;
  }

  private destroyModal(componentRef: ComponentRef<any>): void {
    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;

    // Short delay for exit animation
    setTimeout(() => {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      if (domElem.parentNode) {
        domElem.parentNode.removeChild(domElem);
      }
    }, 220);
  }
}
