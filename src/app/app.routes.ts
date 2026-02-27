import { Routes } from '@angular/router';

import { tasksResolver } from './core/resolvers/tasks.resolver';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'board',
    pathMatch: 'full',
  },
  {
    path: 'board',
    // Lazy Loading: Komponente wird erst beim Navigieren geladen
    // Spring-Analogie: Conditional Bean Loading / @Lazy
    loadComponent: () =>
      import('./features/kanban/kanban-board/kanban-board.component').then(
        m => m.KanbanBoardComponent,
      ),
    // Resolver: Daten werden geladen BEVOR die Komponente rendert
    // Spring-Analogie: @ModelAttribute im Controller
    resolve: { tasks: tasksResolver },
    title: 'Kanban Board',
  },
];
