# Angular Workshop – Moderne Frontend-Entwicklung für Java-Entwickler

Ein Hands-on Workshop für Entwickler mit Java/Spring Boot Hintergrund und Basis-Angular-Kenntnissen. Ziel ist die praxisnahe Vermittlung moderner Angular-Patterns anhand eines vollständigen Kanban Task Managers.

---

## Inhalt

- [Voraussetzungen](#voraussetzungen)
- [Projekt starten](#projekt-starten)
- [Workshop-Materialien](#workshop-materialien)
- [Lernziele & Themen](#lernziele--themen)
- [Workshop-Agenda](#workshop-agenda)
- [Projektstruktur](#projektstruktur)
- [Tech Stack](#tech-stack)
- [Spring Boot → Angular Analogien](#spring-boot--angular-analogien)
- [Angular Migrations](#angular-migrations)

---

## Voraussetzungen

- Node.js ≥ 22
- npm ≥ 10
- Chrome mit [Redux DevTools Extension](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
- VS Code mit [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)

```bash
# Dependencies installieren
npm install

# App starten
npm start
# → http://localhost:4200
```

---

## Projekt starten

```bash
npm start          # Entwicklungsserver auf http://localhost:4200
npm run build      # Produktionsbuild
npm test           # Unit Tests mit Vitest
```

---

## Workshop-Materialien

| Datei | Beschreibung |
|---|---|
| `workshop/slides/index.html` | 44-Slide HTML-Präsentation (im Browser öffnen, Pfeiltasten zur Navigation) |
| `workshop/guide/facilitator-guide.md` | Leitfaden für den Workshop-Leiter (Timing, Q&A, Troubleshooting) |
| `workshop/exercises/exercise-01-signals.md` | Übung 1 – Signals & Directives |
| `workshop/exercises/exercise-02-ngxs-state.md` | Übung 2 – NGXS State Management |
| `workshop/exercises/exercise-03-rxjs-httpclient.md` | Übung 3 – HTTP Client, Interceptor & RxJS |
| `workshop/exercises/exercise-04-reactive-forms.md` | Übung 4 – Reactive Forms & FormBuilder |
| `workshop/exercises/exercise-05-drag-drop.md` | Übung 5 – CDK Drag & Drop |
| `workshop/exercises/exercise-06-migrations.md` | Übung 6 (Bonus) – Angular Migrations |

**Präsentation öffnen:**
```bash
open workshop/slides/index.html
# Navigation: Pfeiltasten ↑↓ oder Leertaste
```

---

## Lernziele & Themen

### ⚡ Signals & Reaktivität
Angulars neues reaktives Primitiv – kein Zone.js mehr nötig.

```typescript
// signal() – reaktiver Zustand
readonly showForm = signal(false);

// computed() – abgeleiteter Wert (gecacht)
readonly completionPercent = computed(() =>
  Math.round((this.taskCount().done / this.taskCount().total) * 100)
);

// effect() – Seiteneffekte bei Zustandsänderung
constructor() {
  effect(() => console.log('Formular:', this.showForm()));
}

// toSignal() – Brücke Observable → Signal (NGXS ↔ Angular)
readonly todoTasks = toSignal(this.store.select(TaskSelectors.todoTasks), { initialValue: [] });
```

---

### 🎯 Directives – Attribute Directives
Wiederverwendbares DOM-Verhalten ohne Logik in der Komponente.

```typescript
@Directive({ selector: '[appPriorityBorder]', standalone: true })
export class PriorityBorderDirective implements OnChanges {
  readonly priority = input<TaskPriority>('low', { alias: 'appPriorityBorder' });
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnChanges() {
    this.renderer.setStyle(this.el.nativeElement, 'border-left',
      `4px solid ${this.colorMap[this.priority()]}`);
  }
}
```

*Spring-Analogie: Custom Annotation + AOP-Aspect*

---

### 🗃 NGXS State Management
Globaler, reaktiver State mit Decorators – wenig Boilerplate.

```typescript
// Actions = typsichere Events
export class AddTask {
  static readonly type = '[Task] Add';
  constructor(public payload: Omit<Task, 'id' | 'createdAt'>) {}
}

// State = Singleton mit Event-Handlern
@State<TaskStateModel>({ name: 'tasks', defaults: { tasks: [], filter: '', ... } })
@Injectable()
export class TaskState {
  @Action(AddTask)
  addTask(ctx: StateContext<TaskStateModel>, action: AddTask) {
    ctx.patchState({ tasks: [...ctx.getState().tasks, { ...action.payload, id: crypto.randomUUID() }] });
  }
}

// Selectors = gecachte Query-Funktionen
export class TaskSelectors {
  @Selector([TaskState])
  static todoTasks(state: TaskStateModel): Task[] {
    return state.tasks.filter(t => t.status === 'todo');
  }
}
```

*Spring-Analogie: `@Service` + `@EventListener` + JPA Repository*

---

### 🌐 HTTP Client & RxJS
Reaktive HTTP-Kommunikation mit Operatoren.

```typescript
// Service
fetchTodos(): Observable<TodoApiItem[]> {
  return this.http.get<TodoApiItem[]>(`${this.baseUrl}/todos`).pipe(
    retry({ count: 2, delay: 1000 }),
    tap(todos => console.log(`${todos.length} Todos geladen`)),
    catchError(err => throwError(() => new Error('API Fehler')))
  );
}

// Suchfeld mit Debounce
this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  takeUntilDestroyed()
).subscribe(value => this.store.dispatch(new SetFilter(value ?? '')));
```

*Spring-Analogie: WebClient + `@Async` + Flux-Operatoren*

---

### 🔒 HTTP Interceptor
Globale Request-Verarbeitung ohne Code in jedem Service.

```typescript
// Funktionaler Interceptor (Angular 15+)
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  loadingService.start();
  return next(req).pipe(finalize(() => loadingService.stop()));
};

// Registrierung in app.config.ts
provideHttpClient(withInterceptors([loadingInterceptor]))
```

*Spring-Analogie: `HandlerInterceptor.preHandle()` / `afterCompletion()`*

---

### 🔀 Route Resolver
Daten werden geladen bevor die Komponente rendert – kein leerer Zustand.

```typescript
export const tasksResolver: ResolveFn<void> = () => {
  const store = inject(Store);
  const existing = store.selectSnapshot(TaskSelectors.allTasks);
  return existing.length === 0 ? store.dispatch(new LoadTasksFromApi()) : of(undefined);
};

// In app.routes.ts
{ path: 'board', resolve: { tasks: tasksResolver }, loadComponent: () => import('./kanban-board.component')... }
```

*Spring-Analogie: `@ModelAttribute` im Controller / Before-AOP-Advice*

---

### 📝 Reactive Forms & FormBuilder
Typsichere Formulare mit deklarativer Validierung.

```typescript
taskForm = this.fb.group({
  title:    ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
  priority: ['medium' as TaskPriority, Validators.required],
  assignee: [''],
});

// Signal für Submit-Status (Fehler erst nach Submit anzeigen)
submitted = signal(false);

// Custom Validator
function noDuplicateTitleValidator(store: Store): ValidatorFn {
  return (control) => {
    const exists = store.selectSnapshot(TaskSelectors.allTasks)
      .some(t => t.title.toLowerCase() === control.value?.toLowerCase());
    return exists ? { duplicateTitle: true } : null;
  };
}
```

*Spring-Analogie: `@Valid` + `BindingResult` + Custom `ConstraintValidator`*

---

### 🖱 CDK Drag & Drop
Interaktives Verschieben zwischen Kanban-Spalten.

```html
<!-- Board: Gruppe für alle verbundenen Drop-Listen -->
<div class="kanban-board" cdkDropListGroup>
  <app-kanban-column columnId="todo"        [tasks]="todoTasks()"       (taskDropped)="onTaskDropped($event)" />
  <app-kanban-column columnId="in-progress" [tasks]="inProgressTasks()" (taskDropped)="onTaskDropped($event)" />
  <app-kanban-column columnId="done"        [tasks]="doneTasks()"       (taskDropped)="onTaskDropped($event)" />
</div>

<!-- Spalte: Drop-Liste mit draggable Items -->
<div cdkDropList [id]="columnId()" [cdkDropListData]="tasks()" (cdkDropListDropped)="taskDropped.emit($event)">
  @for (task of tasks(); track task.id) {
    <app-task-card [task]="task" cdkDrag [cdkDragData]="task" />
  }
</div>
```

---

## Workshop-Agenda

| Zeit | Dauer | Typ | Inhalt |
|---|---|---|---|
| 00:00 | 15' | Theorie | Intro, Architektur, Spring → Angular Mapping |
| 00:15 | 15' | Theorie | Signals: `signal()`, `computed()`, `effect()`, `toSignal()` |
| 00:30 | 10' | Theorie | Directives: Attribute Directive, `ElementRef`, `Renderer2` |
| 00:40 | 20' | **Übung 1** | Signals + eigene Directive |
| 01:00 | 10' | **Pause** | |
| 01:10 | 20' | Theorie | NGXS: State, Actions, Selectors, Redux DevTools |
| 01:30 | 15' | **Übung 2** | NGXS: neue Action + Selector + Progress-Bar |
| 01:45 | 20' | Theorie | HTTP + Interceptor + RxJS-Operatoren |
| 02:05 | 15' | **Übung 3** | `tap`, `retry`, Interceptor-Logging, async/await |
| 02:20 | 5' | Theorie | Route Resolver |
| 02:25 | 5' | **Pause** | |
| 02:30 | 15' | Theorie | Reactive Forms, FormBuilder, Validierung + Signals |
| 02:45 | 20' | **Übung 4** | Custom Validator, Zeichenzähler, Signal+Form |
| 03:05 | 10' | Theorie | CDK Drag & Drop |
| 03:15 | 10' | **Übung 5** | Drop-Zone Guard + visuelles Highlight |
| 03:25 | 10' | Bonus | Angular Migrations: `ng generate @angular/core:signal-inputs` |
| 03:35 | 10' | Abschluss | Key Takeaways, Ressourcen, Q&A |

---

## Projektstruktur

```
src/app/
├── core/
│   ├── models/task.model.ts              # Typen: Task, TaskStatus, TaskPriority
│   ├── services/
│   │   ├── task-api.service.ts           # HTTP → JSONPlaceholder API
│   │   └── loading.service.ts            # Signal-basierter Lade-Service
│   ├── interceptors/loading.interceptor.ts  # HttpInterceptorFn
│   └── resolvers/tasks.resolver.ts       # ResolveFn – Daten vor dem Rendern
├── store/
│   ├── task.actions.ts                   # NGXS Actions (LoadTasksFromApi, AddTask, ...)
│   ├── task.state.ts                     # @State mit @Action Handlers
│   └── task.selectors.ts                 # @Selector (filteredTasks, todoTasks, ...)
├── features/kanban/
│   ├── kanban-board/                     # Seiten-Orchestrator (Signals, CDK, NGXS)
│   ├── kanban-column/                    # Drop-Zone-Spalte (CdkDropList)
│   ├── task-card/                        # Drag-Element (CdkDrag, PriorityBorderDirective)
│   ├── task-form/                        # Formular (FormBuilder, Reactive Forms)
│   └── task-filter/                      # Suchfeld (debounceTime, NGXS)
└── shared/
    ├── pipes/task-priority.pipe.ts       # TaskPriority → Badge Label + CSS-Klasse
    ├── directives/priority-border.directive.ts  # Attribute Directive (Renderer2)
    └── components/loading-spinner/       # Loading-Indicator

workshop/
├── slides/index.html                     # 44-Slide HTML-Präsentation
├── guide/facilitator-guide.md            # Leitfaden für Workshop-Leiter
└── exercises/                            # 6 Übungen (exercise-01 bis exercise-06)
```

---

## Tech Stack

| Technologie | Version | Zweck |
|---|---|---|
| Angular | 21.2.0 | Framework (Standalone Components, Signals, Control Flow) |
| NGXS Store | 21.0.0 | State Management |
| RxJS | 7.8.2 | Reaktive Programmierung |
| Angular CDK | 21.2.0 | Drag & Drop |
| Bootstrap | 5.3.8 | Styling (via npm) |
| TypeScript | 5.9.3 | Sprache |
| Vitest | 4.x | Unit Tests |

---

## Spring Boot → Angular Analogien

| Spring Boot | Angular | Beschreibung |
|---|---|---|
| `@SpringBootApplication` | `bootstrapApplication()` | Anwendungs-Einstiegspunkt |
| `@Component` (Bean) | `@Component` (Standalone) | Verwaltete Klasse |
| `@Service` | `@Injectable({ providedIn: 'root' })` | Singleton Service |
| `@Autowired` | `inject()` Funktion | Dependency Injection |
| `ApplicationContext` | Angular DI Container | IoC Container |
| `@EventListener` | NGXS `@Action` | Event-Handler |
| JPA Repository | NGXS `@Selector` | Datenzugriff-Schicht |
| `Mono<T>` / `Flux<T>` | `Observable<T>` / `Signal<T>` | Reaktive Typen |
| `HandlerInterceptor` | `HttpInterceptorFn` | Request-Lifecycle |
| `@ModelAttribute` | `ResolveFn` (Route Resolver) | Daten vor dem Render |
| `@Valid` + `BindingResult` | `FormBuilder` + `Validators` | Formularvalidierung |
| Custom Annotation + AOP | `@Directive` + `Renderer2` | Deklaratives Verhalten |

---

## Angular Migrations

Angular CLI bietet Schematics um bestehenden Code automatisch zu modernisieren – analog zu **OpenRewrite** in der Java-Welt.

```bash
# Vorschau (kein Code wird geändert)
npx ng generate @angular/core:<migration> --dry-run

# Ausführen
npx ng generate @angular/core:<migration>
```

| Migration | Was wird modernisiert |
|---|---|
| `signal-inputs` | `@Input()` → `input()` |
| `outputs` | `@Output() EventEmitter` → `output()` |
| `signal-queries` | `@ViewChild/@ContentChild` → `viewChild()/contentChild()` |
| `inject-function` | Konstruktor-Injection → `inject()` |
| `standalone` | NgModule-Apps → Standalone Components |
| `control-flow` | `*ngIf`/`*ngFor` → `@if`/`@for` |
| `route-lazy-loading` | Eager Routes → Lazy-loaded Routes |
| `self-closing-tags` | `<comp></comp>` → `<comp />` |
| `cleanup-unused-imports` | Ungenutzte Imports entfernen |

> **Hinweis:** In diesem Projekt wurden `signal-inputs` und `outputs` bereits automatisch durch den Linter angewendet.

---

## Ressourcen

- [angular.dev](https://angular.dev) – Offizielle Angular Dokumentation
- [ngxs.io](https://www.ngxs.io) – NGXS Dokumentation
- [rxjs.dev](https://rxjs.dev) – RxJS Dokumentation
- [angular.dev/reference/migrations](https://angular.dev/reference/migrations) – Angular Migrations
- [material.angular.io/cdk](https://material.angular.io/cdk/categories) – Angular CDK
