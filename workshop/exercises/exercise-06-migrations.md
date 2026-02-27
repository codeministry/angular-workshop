# Übung 6 (Bonus) – Angular Migrations: Automatische Code-Modernisierung

## Ziel

Lernen wie Angular CLI Migrations (`ng generate @angular/core:<migration>`) bestehenden Code automatisch in moderne Patterns umwandeln – analog zu **OpenRewrite** in der Java/Spring-Welt.

---

## Kontext: Was sind Angular Migrations?

Angular liefert Schematics mit die bestehenden Code **sicher und automatisch modernisieren**:

```bash
ng generate @angular/core:<migration-name>
```

Optional immer zuerst **Dry-Run** ausführen um zu sehen was geändert würde:

```bash
ng generate @angular/core:<migration-name> --dry-run
```

---

## Alle verfügbaren Migrations

| Migration | Was wird modernisiert | ng-Befehl |
|---|---|---|
| `signal-inputs` | `@Input()` → `input()` | `@angular/core:signal-inputs` |
| `outputs` | `@Output()` → `output()` | `@angular/core:outputs` |
| `signal-queries` | `@ViewChild/@ContentChild` → `viewChild()` / `contentChild()` | `@angular/core:signal-queries` |
| `inject-function` | Konstruktor-Injection → `inject()` | `@angular/core:inject-function` |
| `standalone` | NgModule-Apps → Standalone Components | `@angular/core:standalone` |
| `control-flow` | `*ngIf`/`*ngFor` → `@if`/`@for` | `@angular/core:control-flow` |
| `route-lazy-loading` | Eager Routes → Lazy-loaded Routes | `@angular/core:route-lazy-loading` |
| `self-closing-tags` | `<comp></comp>` → `<comp />` | `@angular/core:self-closing-tags` |
| `ngclass-to-class` | `[ngClass]` → `[class.x]` Bindings | `@angular/core:ngclass-to-class` |
| `ngstyle-to-style` | `[ngStyle]` → `[style.x]` Bindings | `@angular/core:ngstyle-to-style` |
| `cleanup-unused-imports` | Ungenutzte Imports entfernen | `@angular/core:cleanup-unused-imports` |

---

## Aufgaben

### 1. Dry-Run: Signal Inputs (5 Min)

Führe die Migration im Dry-Run-Modus aus um zu sehen welche Dateien betroffen wären:

```bash
npx ng generate @angular/core:signal-inputs --dry-run
```

**Beobachte:** Welche Dateien würden wie verändert?

> **Hinweis:** In diesem Projekt hat der Linter die Migration bereits automatisch angewendet (`@Input()` wurde zu `input()` konvertiert). Das ist das erwartete Ergebnis.

---

### 2. Was hat der Linter automatisch migriert?

Vergleiche die aktuellen Dateien mit dem was wir ursprünglich geschrieben haben:

**Vorher (`@Input()` Decorator):**
```typescript
@Component({ ... })
export class KanbanColumnComponent {
  @Input({ required: true }) columnId!: TaskStatus;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) tasks: Task[] = [];
  @Output() taskDropped = new EventEmitter<CdkDragDrop<Task[]>>();
}
```

**Nachher (Signal-basiert, durch Linter/Migration):**
```typescript
@Component({ ... })
export class KanbanColumnComponent {
  readonly columnId = input.required<TaskStatus>();
  readonly title = input.required<string>();
  readonly tasks = input.required<Task[]>();
  readonly taskDropped = output<CdkDragDrop<Task[]>>();
}
```

**Unterschiede:**
- `input.required<T>()` statt `@Input({ required: true })`
- `input<T>(defaultValue)` statt `@Input()`
- `output<T>()` statt `@Output() EventEmitter<T>()`
- Kein `!` (Non-null Assertion) nötig
- Alle als `readonly` deklariert
- Im Template: `task()` statt `task` (Signal-Aufruf!)

---

### 3. Control Flow Migration simulieren

Erstelle eine Test-Datei `test.html` mit altem Angular-Template-Code:

```html
<!-- Altes Pattern mit *ngIf und *ngFor -->
<div *ngIf="showForm">
  <span *ngFor="let item of items; trackBy: trackById">
    {{ item.name }}
  </span>
</div>
<ng-container *ngSwitchCase="'todo'">Zu erledigen</ng-container>
```

Führe die Control-Flow-Migration aus:

```bash
npx ng generate @angular/core:control-flow
```

**Ergebnis:**
```html
@if (showForm) {
  @for (item of items; track item.id) {
    {{ item.name }}
  }
}
@switch (status) {
  @case ('todo') { Zu erledigen }
}
```

---

### 4. inject() Migration (Theorie)

Die `inject-function` Migration wandelt Konstruktor-Injection automatisch um:

**Vorher:**
```typescript
constructor(
  private store: Store,
  private fb: FormBuilder,
  private router: Router
) {}
```

**Nachher (nach Migration):**
```typescript
private readonly store = inject(Store);
private readonly fb = inject(FormBuilder);
private readonly router = inject(Router);
```

**Vorteil:** Kein leerer Konstruktor nötig – cleaner Code. Direktes `inject()` im Feld-Initialisierer.

---

### 5. Bonus – Eigene bestehende App migrieren

Habt ihr eine bestehende Angular-App (ggf. mit NgModules)?

Migrations-Reihenfolge für eine ältere Angular-App empfohlen:

```bash
# Schritt 1: Standalone (NgModule entfernen)
npx ng generate @angular/core:standalone

# Schritt 2: Control Flow Syntax
npx ng generate @angular/core:control-flow

# Schritt 3: inject() Funktion
npx ng generate @angular/core:inject-function

# Schritt 4: Signal Inputs
npx ng generate @angular/core:signal-inputs

# Schritt 5: Signal Outputs
npx ng generate @angular/core:outputs

# Schritt 6: Aufräumen
npx ng generate @angular/core:cleanup-unused-imports
```

> ⚠️ Immer **--dry-run zuerst** und **Git-Commit vor jeder Migration**!

---

## Erfolgskriterien

- [ ] Verständnis was Angular Schematics/Migrations sind
- [ ] Unterschied zwischen altem `@Input()/@Output()` und neuem `input()/output()` verstanden
- [ ] Wissen dass im Template Signal-Inputs mit `()` aufgerufen werden: `task()` statt `task`
- [ ] Dry-Run Modus bekannt
- [ ] Migrations-Reihenfolge für Legacy-Apps bekannt

---

## Spring/Java-Analogie

| Angular Migration | OpenRewrite Rezept |
|---|---|
| `:standalone` | `org.openrewrite.java.spring.boot3.UpgradeSpringBoot_3_0` |
| `:control-flow` | `org.openrewrite.java.migrate.lang.UseTextBlocks` |
| `:inject-function` | `org.openrewrite.java.spring.NoAutowiredOnConstructor` |
| `:cleanup-unused-imports` | `org.openrewrite.java.RemoveUnusedImports` |

Beide Ansätze: **automatisch, sicher, reversibel via Git**.
