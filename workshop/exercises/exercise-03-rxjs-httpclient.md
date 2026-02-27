# Übung 3 – HTTP Client + Interceptor + RxJS (15 Min)

## Ziel

RxJS-Operatoren in der Praxis anwenden: `tap`, `retry`, Interceptor erweitern und optional async/await kennenlernen.

---

## Aufgaben

### 1. tap() – Seiteneffekt ohne Transformation (3 Min)

Datei: `src/app/core/services/task-api.service.ts`

Füge `tap()` zur Pipeline hinzu um die API-Antwort zu loggen:

```typescript
import { catchError, tap } from 'rxjs';

fetchTodos(): Observable<TodoApiItem[]> {
  return this.http.get<TodoApiItem[]>(`${this.baseUrl}/todos`).pipe(
    tap(todos => console.log(`[API] ${todos.length} Todos geladen`)),
    catchError(err => throwError(() => new Error('Fehler beim Laden')))
  );
}
```

**Prüfe:** Lade die App neu und schaue in die Konsole.

---

### 2. retry() – Wiederholungsversuche (3 Min)

Füge `retry()` **vor** `catchError()` ein:

```typescript
import { catchError, retry, tap } from 'rxjs';

fetchTodos(): Observable<TodoApiItem[]> {
  return this.http.get<TodoApiItem[]>(`${this.baseUrl}/todos`).pipe(
    retry({ count: 2, delay: 1000 }),  // 2 Versuche, 1s Wartezeit
    tap(todos => console.log(`[API] ${todos.length} Todos geladen`)),
    catchError(err => throwError(() => new Error('Alle Versuche fehlgeschlagen')))
  );
}
```

**Prüfe Fehlerfall:**
1. Ändere die URL temporär zu `/todos-fehler`
2. Öffne Netzwerk-Tab in DevTools
3. Beobachte die 3 Anfragen (1 + 2 Wiederholungen)
4. Nach Fehlschlag: Fehlermeldung im UI prüfen

---

### 3. Interceptor erweitern – Timing loggen (4 Min)

Datei: `src/app/core/interceptors/loading.interceptor.ts`

Ergänze den Interceptor um Timing-Logging:

```typescript
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { tap, finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const start = performance.now();

  console.log(`[HTTP →] ${req.method} ${req.url}`);
  loadingService.start();

  return next(req).pipe(
    tap({
      next: () => {
        const ms = (performance.now() - start).toFixed(0);
        console.log(`[HTTP ←] ${req.method} ${req.url} (${ms}ms)`);
      },
      error: err => console.error(`[HTTP ✗] ${req.url}`, err)
    }),
    finalize(() => loadingService.stop())
  );
};
```

**Prüfe:** Jede HTTP-Anfrage erscheint mit URL und Dauer in der Konsole.

---

### 4. Bonus – async/await mit firstValueFrom (5 Min)

Schreibe den `loadTasksFromApi` Action Handler als async Funktion um:

```typescript
import { firstValueFrom } from 'rxjs';

@Action(LoadTasksFromApi)
async loadTasksFromApi(ctx: StateContext<TaskStateModel>) {
  try {
    const todos = await firstValueFrom(this.taskApiService.fetchTodos());
    const tasks = todos.slice(0, 15).map(todo => this.mapTodoToTask(todo));
    ctx.dispatch(new LoadTasksSuccess(tasks));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unbekannter Fehler';
    ctx.dispatch(new LoadTasksFailure(msg));
  }
}
```

**Diskussion:** Wann Observable, wann async/await?
- Observable: wenn mehrere Werte über Zeit (Streams, WebSockets)
- async/await: wenn ein einzelner Wert erwartet wird (HTTP GET)

---

## Erfolgskriterien

- [ ] `tap()` loggt die Anzahl geladener Todos in die Konsole
- [ ] `retry()` macht 2 Wiederholungsversuche bei Fehler
- [ ] Interceptor loggt URL und Dauer jeder Anfrage
- [ ] (Bonus) Action Handler funktioniert mit `firstValueFrom()`

---

## Hilfestellung

RxJS Operatoren – Reihenfolge in der Pipe spielt eine Rolle!

```
HTTP GET → retry (bei Fehler) → tap (immer) → catchError (letzter Ausweg)
```

- `tap()` – Seiteneffekt, gibt Original weiter
- `retry()` – vor `catchError()` platzieren!
- `finalize()` – immer ausgeführt (Erfolg UND Fehler)
- `firstValueFrom()` – Observable → Promise (1 Wert)
