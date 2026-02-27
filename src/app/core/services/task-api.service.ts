import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { TodoApiItem } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  // inject() statt Konstruktor-Injection (Angular 14+ Modern Pattern)
  // Spring-Analogie: @Autowired auf Feldebene
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://jsonplaceholder.typicode.com';

  fetchTodos(): Observable<TodoApiItem[]> {
    return this.http.get<TodoApiItem[]>(`${this.baseUrl}/todos`).pipe(
      catchError(err => {
        console.error('[TaskApiService] Fehler beim Laden der Aufgaben:', err);
        return throwError(() => new Error('Aufgaben konnten nicht geladen werden'));
      }),
    );
  }
}
