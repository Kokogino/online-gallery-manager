import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { Configuration } from '@app/gen/ogm-backend';
import { environment } from '@environments/environment';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { ThemeService } from '@app/core/services/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(),
    provideAnimations(),
    {
      provide: Configuration,
      useFactory: () => new Configuration({ basePath: environment.backendBaseUrl }),
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (themeService: ThemeService) => () => themeService.loadTheme(),
      deps: [ThemeService],
      multi: true,
    },
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline', subscriptSizing: 'dynamic' } },
  ],
};
