import {Component} from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Lädt...</span>
      </div>
      <span class="ms-3 text-muted">Aufgaben werden geladen...</span>
    </div>
  `,
})
export class LoadingSpinnerComponent {
}
