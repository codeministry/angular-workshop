# Übung 2 – NGXS State Management (15 Min)

## Ziel

Eine neue Action hinzufügen, den Handler implementieren, einen neuen Selector erstellen und das Ergebnis in der UI anzeigen. Dabei Redux DevTools beobachten.

---

## Aufgaben

### 1. Neue Action erstellen (3 Min)

Datei: `src/app/store/task.actions.ts`

Füge eine neue Action hinzu:

```typescript
export class ToggleTaskStatus {
  static readonly type = '[Task] Toggle Status';
  constructor(public taskId: string) {}
}
```

**Was sie tun soll:** Status zwischen `'in-progress'` und `'done'` wechseln.

---

### 2. @Action Handler implementieren (5 Min)

Datei: `src/app/store/task.state.ts`

Füge den Handler in `TaskState` hinzu:

```typescript
@Action(ToggleTaskStatus)
toggleTaskStatus(ctx: StateContext<TaskStateModel>, action: ToggleTaskStatus) {
  const tasks = ctx.getState().tasks.map(t => {
    if (t.id !== action.taskId) return t;
    const newStatus: TaskStatus = t.status === 'done' ? 'in-progress' : 'done';
    return { ...t, status: newStatus };
  });
  ctx.patchState({ tasks });
}
```

**Vergiss nicht:** `ToggleTaskStatus` importieren!

---

### 3. Selector für Abschluss-Prozentsatz (4 Min)

Datei: `src/app/store/task.selectors.ts`

Füge einen neuen Selector hinzu:

```typescript
@Selector([TaskState])
static completionPercent(state: TaskStateModel): number {
  if (state.tasks.length === 0) return 0;
  const done = state.tasks.filter(t => t.status === 'done').length;
  return Math.round((done / state.tasks.length) * 100);
}
```

---

### 4. Progress-Bar in der UI anzeigen (3 Min)

Datei: `src/app/features/kanban/kanban-board/kanban-board.component.ts`

Füge das Signal hinzu:

```typescript
readonly completionPercent = toSignal(
  this.store.select(TaskSelectors.completionPercent),
  { initialValue: 0 }
);
```

Datei: `kanban-board.component.html`

Ersetze oder ergänze den bestehenden Progress-Bar:

```html
@if (taskCount().total > 0) {
  <div class="progress mb-3" style="height: 8px;">
    <div
      class="progress-bar bg-success"
      [style.width.%]="completionPercent()"
      role="progressbar">
    </div>
  </div>
  <small class="text-muted">{{ completionPercent() }}% abgeschlossen</small>
}
```

---

### 5. Bonus – DevTools beobachten

1. Öffne Redux DevTools (F12 → Redux Tab)
2. Klicke auf den Toggle-Button (erstelle einen Button in `TaskCardComponent`)
3. Beobachte die Action `[Task] Toggle Status` im DevTools-Log
4. Klicke auf die Action → sieh den State vor/nach der Änderung

---

## Erfolgskriterien

- [ ] Action `ToggleTaskStatus` existiert in `task.actions.ts`
- [ ] `@Action(ToggleTaskStatus)` Handler ist in `TaskState` implementiert
- [ ] Selector `completionPercent` berechnet korrekt
- [ ] Progress-Bar im Board zeigt den richtigen Prozentwert
- [ ] Redux DevTools zeigt die Action beim Dispatch

---

## Hilfestellung

- `ctx.getState()` – aktuellen State lesen
- `ctx.patchState({ ... })` – State partiell aktualisieren
- `store.dispatch(new ToggleTaskStatus(task.id))` – Action dispatchen
- Selectors sind gecacht: werden nur neu berechnet wenn sich der Input-State ändert
