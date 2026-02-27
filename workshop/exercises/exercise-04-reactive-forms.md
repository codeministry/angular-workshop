# Übung 4 – Reactive Forms & FormBuilder (20 Min)

## Ziel

Formulare mit erweiterten Validierungen und Signal-Integration ausbauen. Custom Validator schreiben.

---

## Aufgaben

### 1. Zeichenzähler mit maxLength (4 Min)

Datei: `src/app/features/kanban/task-form/task-form.component.ts`

Füge `Validators.maxLength(100)` zum Titel hinzu:

```typescript
taskForm = this.fb.group({
  title: ['', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(100)  // NEU
  ]],
  // ...
});
```

Füge ein `computed()` Signal für die aktuelle Zeichenlänge hinzu:

```typescript
// Benötigt toSignal() für valueChanges
readonly titleValue = toSignal(
  this.taskForm.get('title')!.valueChanges,
  { initialValue: '' }
);

readonly titleLength = computed(() => this.titleValue()?.length ?? 0);
```

Im Template: Zeichenzähler anzeigen:

```html
<div class="d-flex justify-content-between">
  <label class="form-label">Titel *</label>
  <small [class.text-danger]="titleLength() > 90">
    {{ titleLength() }} / 100
  </small>
</div>
```

---

### 2. Formular-Status als Signal (3 Min)

Füge ein Signal hinzu das `true` ist wenn das Formular bereit zum Absenden ist:

```typescript
readonly isFormReady = computed(() =>
  this.taskForm.valid && this.taskForm.dirty
);
```

Deaktiviere den Submit-Button:

```html
<button type="submit" class="btn btn-primary" [disabled]="!isFormReady()">
  ✔ Erstellen
</button>
```

**Prüfe:** Button ist deaktiviert bis Pflichtfelder ausgefüllt sind.

---

### 3. Custom Validator – Keine Duplikate (8 Min)

Erstelle einen Custom Validator der prüft ob ein Titel bereits existiert.

Datei: `src/app/features/kanban/task-form/task-form.component.ts`

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Store } from '@ngxs/store';
import { TaskSelectors } from '../../../store/task.selectors';

// Factory-Funktion – gibt eine ValidatorFn zurück
function noDuplicateTitleValidator(store: Store): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const existingTasks = store.selectSnapshot(TaskSelectors.allTasks);
    const isDuplicate = existingTasks.some(
      t => t.title.toLowerCase() === control.value?.toLowerCase()
    );
    return isDuplicate ? { duplicateTitle: true } : null;
  };
}
```

Validator im FormGroup einbinden:

```typescript
taskForm = this.fb.group({
  title: ['', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(100),
    noDuplicateTitleValidator(this.store)  // NEU – Store injizieren
  ]],
  // ...
});
```

Fehlermeldung im Template:

```html
@if (submitted() && taskForm.get('title')?.errors?.['duplicateTitle']) {
  <div class="invalid-feedback">
    Eine Aufgabe mit diesem Titel existiert bereits.
  </div>
}
```

---

### 4. Bonus – valueChanges als Signal (5 Min)

Logge alle Formularwert-Änderungen via `effect()`:

```typescript
private readonly formValues = toSignal(this.taskForm.valueChanges);

constructor() {
  effect(() => {
    const values = this.formValues();
    if (values) {
      console.log('[Form] Aktuelle Werte:', values);
    }
  });
}
```

**Diskussion:** Wann ist `toSignal(observable)` besser als `.subscribe()`?
- Mit `toSignal()`: Angular verwaltet das Subscription-Lifecycle automatisch
- Kein manuelles `unsubscribe()` oder `takeUntilDestroyed()` nötig

---

## Erfolgskriterien

- [ ] Zeichenzähler zeigt aktuelle Länge (rot ab 90 Zeichen)
- [ ] Submit-Button ist deaktiviert wenn Formular ungültig oder unberührt
- [ ] Doppelter Titel zeigt Fehlermeldung
- [ ] `Validators.maxLength(100)` verhindert zu lange Titel
- [ ] (Bonus) `effect()` loggt Formularwerte in die Konsole

---

## Hilfestellung

```typescript
// Formularwert lesen
this.taskForm.get('title')?.value

// Validator-Fehler prüfen
control.errors?.['required']      // true/false
control.errors?.['minlength']     // { actualLength, requiredLength }
control.errors?.['myCustomError'] // Custom Error

// Status prüfen
control.valid    // true wenn alle Validators bestehen
control.dirty    // true wenn Wert geändert wurde
control.touched  // true wenn Feld fokussiert und verlassen wurde
```
