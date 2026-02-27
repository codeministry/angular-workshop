import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { LoadTasksFromApi } from '../../store/task.actions';
import { TaskSelectors } from '../../store/task.selectors';

/**
 * Route Resolver – stellt sicher, dass Daten VOR dem Rendern der Komponente geladen sind.
 *
 * Spring-Analogie: @ModelAttribute-Methode im Controller oder ein Before-AOP-Advice.
 * Die KanbanBoardComponent muss sich nicht selbst um das initiale Laden kümmern.
 *
 * Idempotent: Lädt nur wenn der State noch leer ist.
 */
export const tasksResolver: ResolveFn<void> = () => {
  const store = inject(Store);

  // selectSnapshot = synchrone Abfrage des aktuellen States (kein Observable)
  const existingTasks = store.selectSnapshot(TaskSelectors.allTasks);

  if (existingTasks.length === 0) {
    // Dispatch gibt ein Observable zurück – der Router wartet auf dessen Abschluss
    return store.dispatch(new LoadTasksFromApi());
  }

  return of(undefined);
};
