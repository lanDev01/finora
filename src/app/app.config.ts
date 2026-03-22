import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  type ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { catchError, of } from 'rxjs';
import localePtBr from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localePtBr);

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { UserService } from './core/services/user.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideAppInitializer(() => {
      const userService = inject(UserService);
      if (!localStorage.getItem('access_token')) return of(null);
      return userService.loadProfile().pipe(catchError(() => of(null)));
    }),
  ],
};
