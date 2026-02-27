# Übung 1 – Signals & Directives (20 Min)

## Ziel

Praxis mit den drei Signal-APIs (`signal`, `computed`, `effect`) und dem Erstellen einer eigenen Attribute Directive.

---

## Vorbereitung

Öffne: `src/app/features/kanban/kanban-board/kanban-board.component.ts`

---

## Aufgaben

### 1. Signal erstellen (5 Min)

Füge ein neues Signal `clickCount` zur `KanbanBoardComponent` hinzu:

```typescript
// In KanbanBoardComponent
readonly clickCount = signal(0);
```

Füge im Template (`kanban-board.component.html`) einen Button hinzu:

```html
<button class="btn btn-sm btn-outline-secondary" (click)="clickCount.update(v => v + 1)">
  Geklickt: {{ clickCount() }}×
</button>
```

**Prüfe:** Die Zahl erhöht sich bei jedem Klick ohne `ChangeDetectorRef`!

---

### 2. computed() Signal (5 Min)

Füge ein `computed()` Signal hinzu das den doppelten Wert berechnet:

```typescript
readonly doubleCount = computed(() => this.clickCount() * 2);
```

Zeige beide Werte im Template:

```html
<small class="text-muted">Doppelt: {{ doubleCount() }}</small>
```

**Prüfe:** `doubleCount` aktualisiert sich automatisch wenn `clickCount` sich ändert.

---

### 3. effect() (5 Min)

Füge einen `effect()` im Konstruktor hinzu:

```typescript
constructor() {
  effect(() => {
    // Automatisch aufgerufen wenn clickCount() sich ändert
    console.log(`[Effect] clickCount geändert: ${this.clickCount()}`);
  });
}
```

**Prüfe:** Öffne die Browser-Konsole. Bei jedem Klick erscheint eine Nachricht.

---

### 4. Eigene Directive erstellen (5 Min)

Erstelle eine neue Datei: `src/app/shared/directives/highlight.directive.ts`

```typescript
import { Directive, ElementRef, Input, OnChanges, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective implements OnChanges {
  @Input('appHighlight') active = false;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnChanges(): void {
    this.renderer.setStyle(
      this.el.nativeElement,
      'background-color',
      this.active ? '#fff3cd' : 'transparent'
    );
  }
}
```

Importiere die Directive in `KanbanBoardComponent` und verwende sie:

```html
<div [appHighlight]="clickCount() > 0">
  Klick-Zähler: {{ clickCount() }}
</div>
```

---

### 5. Bonus – Directives mit Signals verbinden

Verbinde die `HighlightDirective` mit `clickCount`: Hebe hervor wenn der Wert **größer als 5** ist:

```html
<div [appHighlight]="clickCount() > 5">
  {{ clickCount() > 5 ? '🔥 Mehr als 5!' : clickCount() + ' Klicks' }}
</div>
```

---

## Erfolgskriterien

- [ ] `clickCount` Signal zählt Klicks korrekt
- [ ] `doubleCount` wird automatisch aktualisiert
- [ ] Browser-Konsole zeigt Effect-Logs
- [ ] `HighlightDirective` ändert Hintergrundfarbe
- [ ] `ChangeDetectorRef` wurde nirgendwo verwendet

---

## Hilfestellung

- Signal lesen: `mySignal()` (als Funktion aufrufen)
- Signal schreiben: `mySignal.set(value)` oder `mySignal.update(fn)`
- Dokumentation: [angular.dev/guide/signals](https://angular.dev/guide/signals)
