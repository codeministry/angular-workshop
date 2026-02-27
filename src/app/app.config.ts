import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngxs/store';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';

import { routes } from './app.routes';
import { TaskState } from './store/task.state';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(routes, withComponentInputBinding()),

    // HTTP Client mit funktionalem Interceptor
    // Spring-Analogie: FilterChain mit HandlerInterceptor
    provideHttpClient(withInterceptors([loadingInterceptor])),

    // NGXS Store – globales State Management
    // Spring-Analogie: ApplicationContext mit Singleton-Beans
    provideStore(
      [TaskState],
      withNgxsLoggerPlugin({ disabled: true }), // Im Workshop auf false setzen für Debugging
      withNgxsReduxDevtoolsPlugin({ disabled: false }),
    ),
  ],
};
