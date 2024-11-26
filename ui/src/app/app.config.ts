import { ApplicationConfig, provideZoneChangeDetection, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Configuration } from '@app/gen/ogm-backend';
import { environment } from '@environments/environment';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { ThemeService } from '@app/shared/services/theme.service';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import 'moment/locale/de-ch';
import { httpCacheInterceptor } from '@app/shared/util/http-cache-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([httpCacheInterceptor()])),
    provideAnimations(),
    provideMomentDateAdapter(),
    provideAppInitializer(() => inject(ThemeService).loadTheme()),
    {
      provide: Configuration,
      useFactory: () => new Configuration({ basePath: environment.backendBaseUrl }),
    },
    { provide: MAT_DATE_LOCALE, useValue: 'de-CH' },
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic' } },
  ],
};
