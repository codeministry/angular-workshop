# Übung 1 – Signals & Directives (20 Min)

## Ziel

Praxis mit den Signal-APIs (`signal`, `computed`, `effect`, `toSignal`) direkt in der laufenden Kanban-App – und eine eigene Attribute Directive erstellen.

---

## Vorbereitung

Öffne:
- `src/app/features/kanban/kanban-board/kanban-board.component.ts`
- `src/app/features/kanban/kanban-column/kanban-column.component.ts`

Die App läuft auf `http://localhost:4200`. Öffne auch die Browser-Konsole (F12).

---

## Aufgaben

### 1. effect() – Reaktion auf Formular-Öffnen (5 Min)

Das `showForm`-Signal ist bereits in `KanbanBoardComponent` vorhanden:

```typescript
readonly showForm = signal(false);
```

Füge einen `effect()` im Konstruktor hinzu der bei jeder Änderung loggt:

```typescript
constructor() {
  effect(() => {
    // Wird automatisch aufgerufen wenn showForm() sich ändert
    console.log('[Übung 1] Formular sichtbar:', this.showForm());
  });
}
```

**Prüfe:** Öffne das Formular via "Neue Task" → Konsole zeigt `true`. Schließe es → `false`.

> 💡 **Kernprinzip:** `effect()` abonniert Signals automatisch – kein manuelles `subscribe()` nötig!

---

### 2. computed() – Fortschrittsanzeige (5 Min)

`KanbanBoardComponent` hat bereits `taskCount` als Signal (via `toSignal()`).
Das `completionPercent` ist aktuell ein reguläres Getter-Property.

**Wandle es in ein `computed()` Signal um:**

```typescript
// Vorher (regulärer Getter):
get completionPercent(): number {
  const count = this.taskCount();
  return count.total > 0 ? Math.round((count.done / count.total) * 100) : 0;
}

// Nachher (computed Signal):
readonly completionPercent = computed(() => {
  const count = this.taskCount();
  return count.total > 0 ? Math.round((count.done / count.total) * 100) : 0;
});
```

Passe das Template an – `completionPercent` wird jetzt mit `()` aufgerufen:

```html
<!-- Suche im kanban-board.component.html nach completionPercent -->
{{ completionPercent() }}%
```

Importiere `computed` in der Komponentendatei:
```typescript
import { Component, computed, effect, inject, signal } from '@angular/core';
```

**Prüfe:** Der Prozentwert in der Progress-Bar aktualisiert sich wenn Tasks verschoben werden.

> 💡 **Vorteil:** `computed()` ist gecacht – wird nur neu berechnet wenn `taskCount()` sich ändert!

---

### 3. Signal-Inputs verstehen (5 Min)

Öffne `src/app/features/kanban/kanban-column/kanban-column.component.ts`.

Beobachte die `input.required<T>()` Syntax:

```typescript
// Angular 21 Modern Pattern – kein @Input() mehr!
readonly columnId = input.required<TaskStatus>();
readonly title    = input.required<string>();
readonly tasks    = input.required<Task[]>();
```

Öffne das zugehörige Template `kanban-column.component.html`. Suche nach `columnId` und `tasks`:

```html
<!-- Warum steht hier columnId() und tasks() mit Klammern? -->
<div cdkDropList [id]="columnId()" [cdkDropListData]="tasks()">
  @for (task of tasks(); track task.id) { ... }
</div>
```

**Fragen zum Nachdenken:**
- Warum müssen `columnId()` und `tasks()` mit `()` aufgerufen werden?
- Was würde passieren wenn man `columnId` ohne `()` schreibt?
- Wie unterscheidet sich `input.required<T>()` von `input<T>(defaultValue)`?

> 💡 **Antwort:** Signal-Inputs sind Funktionen – genau wie alle anderen Signals. Im Template immer mit `()` lesen!

---

### 4. Eigene Directive mit Signal-Input (5 Min)

Erstelle eine neue Datei: `src/app/shared/directives/highlight.directive.ts`

Die Directive soll eine leere Kanban-Spalte optisch hervorheben:

```typescript
import { Directive, ElementRef, OnChanges, Renderer2, inject, input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnChanges {
  // Signal-Input statt @Input() – moderner Angular 21 Stil
  readonly active = input<boolean>(false);

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  ngOnChanges(): void {
    this.renderer.setStyle(
      this.el.nativeElement,
      'background-color',
      this.active() ? '#fff3cd' : 'transparent'
    );
  }
}
```

Importiere die Directive in `KanbanColumnComponent` und verwende sie im Template:

```typescript
// In kanban-column.component.ts – imports array:
imports: [..., HighlightDirective],
```

```html
<!-- kanban-column.component.html – auf dem äußeren div: -->
<div class="kanban-column" [appHighlight]="tasks().length === 0">
```

**Prüfe:** Eine leere Spalte bekommt einen gelben Hintergrund.

> 💡 **Spring-Analogie:** Die Directive ist wie ein AOP-Aspect – deklarativ anwenden, kein Code in der Hauptkomponente!

---

### 5. Bonus – toObservable() (für Schnelle)

Wandle das `showForm`-Signal in ein Observable um und logge nur das erste Öffnen:

```typescript
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';

constructor() {
  // Signal → Observable → mit RxJS-Operatoren filtern
  toObservable(this.showForm).pipe(
    filter(visible => visible === true),   // Nur wenn Formular geöffnet
    take(1),                               // Nur das erste Mal
  ).subscribe(() => {
    console.log('[Bonus] Formular wurde zum ersten Mal geöffnet!');
  });
}
```

**Prüfe:** Das Log erscheint nur einmal, egal wie oft das Formular geöffnet wird.

---

## Erfolgskriterien

- [ ] `effect()` loggt bei jedem Formular-Öffnen/-Schließen in die Konsole
- [ ] `completionPercent` ist ein `computed()` Signal und wird mit `()` im Template aufgerufen
- [ ] Signal-Inputs in `KanbanColumnComponent` verstanden: `input.required<T>()`
- [ ] `HighlightDirective` hebt leere Spalten optisch hervor
- [ ] `ChangeDetectorRef` wurde nirgendwo verwendet – Signals machen es überflüssig

---

## Hilfestellung

| Concept | Code |
|---|---|
| Signal lesen | `mySignal()` |
| Signal schreiben | `mySignal.set(value)` oder `mySignal.update(fn)` |
| Signal-Input | `readonly x = input<T>(default)` oder `input.required<T>()` |
| Abgeleiteter Wert | `readonly y = computed(() => ...)` |
| Seiteneffekt | `effect(() => { ... })` – im Konstruktor |
| Observable → Signal | `toSignal(obs$, { initialValue: ... })` |
| Signal → Observable | `toObservable(mySignal)` |

- Dokumentation: [angular.dev/guide/signals](https://angular.dev/guide/signals)
