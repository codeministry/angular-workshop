# Übung 5 – CDK Drag & Drop (10 Min)

## Ziel

CDK Drag & Drop verstehen, Business-Rules für Drag-Bewegungen einbauen und Drop-Zonen visuell hervorheben.

---

## Aufgaben

### 1. Drag & Drop funktioniert? (2 Min) – Verifikation

Prüfe ob alles korrekt verbunden ist:

1. App öffnen: `http://localhost:4200`
2. Eine Task von **"Zu erledigen"** nach **"In Bearbeitung"** ziehen
3. Redux DevTools öffnen → Action `[Task] Update Status` sollte erscheinen
4. Eine Task von **"In Bearbeitung"** nach **"Erledigt"** ziehen

**Falls Drag & Drop nicht funktioniert:** Prüfe ob `cdkDropListGroup` im Board-Template vorhanden ist.

---

### 2. Business Rule – Keine Rückwärtsbewegung (4 Min)

Füge einen `cdkDropListEnterPredicate` zur "Zu erledigen"-Spalte hinzu.
Dies verhindert dass Tasks aus "Erledigt" nach "Zu erledigen" gezogen werden.

Datei: `src/app/features/kanban/kanban-column/kanban-column.component.ts`

Füge einen optionalen Input und die Predicate-Funktion hinzu:

```typescript
@Input() enterPredicate: (drag: CdkDrag, drop: CdkDropList) => boolean =
  () => true;
```

Datei: `kanban-column.component.html`

```html
<div
  cdkDropList
  [id]="columnId"
  [cdkDropListData]="tasks"
  [cdkDropListEnterPredicate]="enterPredicate"
  (cdkDropListDropped)="taskDropped.emit($event)">
```

Datei: `kanban-board.component.ts`

```typescript
// Verhindert Drag von 'done' nach 'todo'
readonly todoColumnPredicate = (drag: CdkDrag<Task>) => {
  const task = drag.data as Task;
  return task.status !== 'done';
};
```

Datei: `kanban-board.component.html`

```html
<app-kanban-column
  columnId="todo"
  [enterPredicate]="todoColumnPredicate"
  ... />
```

**Prüfe:** Versuche eine erledigte Task nach "Zu erledigen" zu ziehen – sie sollte zurückspringen.

---

### 3. Drop-Zone visuell hervorheben (4 Min)

Füge Events zur Spalte hinzu um aktive Drop-Zonen hervorzuheben.

Datei: `kanban-column.component.ts`

```typescript
import { signal } from '@angular/core';

// Lokales Signal für Drop-Zone-Highlight
readonly isDropTarget = signal(false);
```

Datei: `kanban-column.component.html`

```html
<div
  cdkDropList
  [class.drop-target-active]="isDropTarget()"
  (cdkDropListEntered)="isDropTarget.set(true)"
  (cdkDropListExited)="isDropTarget.set(false)"
  (cdkDropListDropped)="isDropTarget.set(false); taskDropped.emit($event)">
```

CSS in `src/styles.css` oder `kanban-column.component.css`:

```css
.drop-target-active {
  background-color: #e3f2fd;
  border: 2px dashed #1976d2;
  border-radius: 0.375rem;
  transition: background-color 0.2s, border 0.2s;
}
```

**Prüfe:** Beim Darüberziehen einer Task leuchtet die Drop-Zone blau auf.

---

### 4. Bonus – Umsortierung innerhalb einer Spalte

Erlaube das Umsortieren von Tasks innerhalb derselben Spalte:

Datei: `kanban-board.component.ts`

```typescript
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

onTaskDropped(event: CdkDragDrop<Task[]>): void {
  if (event.previousContainer === event.container) {
    // Gleiche Spalte – nur umsortieren (kein NGXS-Dispatch nötig)
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  } else {
    // Andere Spalte – Status ändern via NGXS
    const task: Task = event.previousContainer.data[event.previousIndex];
    const newStatus = event.container.id as TaskStatus;
    this.store.dispatch(new UpdateTaskStatus(task.id, newStatus));
  }
}
```

> **Hinweis:** `moveItemInArray` mutiert das Array direkt. In einer produktiven App sollte die Reihenfolge ebenfalls im NGXS-State gespeichert werden.

---

## Erfolgskriterien

- [ ] Drag & Drop zwischen allen Spalten funktioniert
- [ ] Tasks aus "Erledigt" können nicht nach "Zu erledigen" gezogen werden
- [ ] Drop-Zone hebt sich beim Darüberziehen visuell ab
- [ ] Redux DevTools zeigt `[Task] Update Status` bei Spaltenwechsel
- [ ] (Bonus) Umsortierung innerhalb einer Spalte möglich

---

## Wichtige CDK Events

| Event | Auslöser |
|-------|----------|
| `cdkDropListDropped` | Element wurde losgelassen |
| `cdkDropListEntered` | Element betritt die Drop-Zone |
| `cdkDropListExited` | Element verlässt die Drop-Zone |
| `cdkDragStarted` | Drag beginnt |
| `cdkDragEnded` | Drag endet (mit oder ohne Drop) |
