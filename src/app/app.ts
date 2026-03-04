import {Component, inject, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';

import {LoadingService} from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <nav class="navbar navbar-dark bg-primary shadow-sm">
      <div class="container-fluid">
        <span class="navbar-brand fw-bold fs-5">
          <span class="me-2">📋</span>Kanban Board
        </span>
        <div class="d-flex align-items-center gap-3">
          @if (loadingService.isLoading()) {
            <div class="spinner-border spinner-border-sm text-light" role="status">
              <span class="visually-hidden">Lädt...</span>
            </div>
          }
          <span class="text-white-50 small d-none d-md-inline">Angular Workshop</span>
        </div>
      </div>
    </nav>

    <main class="container-fluid px-4 py-4">
      <router-outlet/>
    </main>
  `,
})
export class App {
  protected readonly title = signal('Kanban Task Manager');
  protected readonly loadingService = inject(LoadingService);
}
