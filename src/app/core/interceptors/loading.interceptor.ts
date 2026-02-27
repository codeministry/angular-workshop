import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';

import { LoadingService } from '../services/loading.service';

/**
 * Funktionaler HTTP-Interceptor (Angular 15+ Style).
 *
 * Spring-Analogie: HandlerInterceptor.preHandle() / afterCompletion()
 *
 * Verwaltet den globalen Ladezustand über den LoadingService.
 * Alle HTTP-Anfragen werden automatisch erfasst – kein manuelles
 * Setzen von loading=true/false in jedem Service nötig.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // inject() funktioniert auch in Funktionen – dank des Injection Context
  const loadingService = inject(LoadingService);

  loadingService.start();

  return next(req).pipe(
    // finalize = immer ausgeführt, egal ob Erfolg oder Fehler
    // Spring-Analogie: finally-Block in einem try-catch
    finalize(() => loadingService.stop()),
  );
};
