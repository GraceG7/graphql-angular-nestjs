import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';
import { APP_ROUTES } from './app.routes';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(APP_ROUTES),
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(
      AuthModule.forRoot({
        authorizationParams: {
          audience: 'shared',
        },
        domain: 'dev-ankke0bl2iasgfy2.au.auth0.com',
        clientId: 'dqdPRZGOwQC5jw6WYB5aI4BA7vqslaio',
        useRefreshTokens: true,
        cacheLocation: 'localstorage',
        httpInterceptor: {
          allowedList: ['http://localhost:3000/*'],
        },
      })
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true,
    },
  ],
};
