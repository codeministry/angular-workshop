import {Injectable, signal} from '@angular/core';

/**
 * Signal-basierter Lade-Service.
 * Verwaltet einen Zähler aktiver HTTP-Anfragen und setzt
 * das isLoading-Signal automatisch auf true/false.
 */
@Injectable({providedIn: 'root'})
export class LoadingService {
  readonly isLoading = signal(false);
  private count = 0;

  start(): void {
    this.count++;
    this.isLoading.set(true);
  }

  stop(): void {
    this.count = Math.max(0, this.count - 1);
    this.isLoading.set(this.count > 0);
  }
}
