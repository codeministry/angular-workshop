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

| Datei                                               | Beschreibung                                                               |
|-----------------------------------------------------|----------------------------------------------------------------------------|
| `workshop/slides/index.html`                        | 44-Slide HTML-Präsentation (im Browser öffnen, Pfeiltasten zur Navigation) |
| `workshop/guide/guide.md`                           | Leitfaden für den Workshop-Leiter (Timing, Q&A, Troubleshooting)           |
| `workshop/exercises/exercise-01-signals.md`         | Übung 1 – Signals & Directives                                             |
| `workshop/exercises/exercise-02-ngxs-state.md`      | Übung 2 – NGXS State Management                                            |
| `workshop/exercises/exercise-03-rxjs-httpclient.md` | Übung 3 – HTTP Client, Interceptor & RxJS                                  |
| `workshop/exercises/exercise-04-reactive-forms.md`  | Übung 4 – Reactive Forms & FormBuilder                                     |
| `workshop/exercises/exercise-05-drag-drop.md`       | Übung 5 – CDK Drag & Drop                                                  |
| `workshop/exercises/exercise-06-migrations.md`      | Übung 6 (Bonus) – Angular Migrations                                       |

**Präsentation öffnen:**

```bash
open workshop/slides/index.html
# Navigation: Pfeiltasten ↑↓ oder Leertaste
```

---

## Lernziele & Themen

### ⚡ Signals & Reaktivität

Angular 16+ führt Signals als neues reaktives Primitiv ein, das Zone.js als Grundlage für Change Detection ablöst. Statt den gesamten Komponentenbaum bei jeder asynchronen Operation zu prüfen, trackt Angular präzise welche Komponente welchen Wert liest – und rendert nur das Betroffene neu.

Ein `signal()` ist ein schreibbarer, reaktiver Wert. Ein `computed()` leitet daraus einen abgeleiteten Wert ab, der automatisch gecacht und nur bei Änderung der Quelldaten neu berechnet wird – vergleichbar mit Memoization in Java. `effect()` reagiert auf Signaländerungen mit Seiteneffekten, sollte aber nicht für State-Mutationen eingesetzt werden. `toSignal()` bildet die Brücke zwischen RxJS Observables (z. B. NGXS-Selektoren) und der Signal-Welt, sodass kein `async`-Pipe im Template nötig ist.

*Spring-Analogie: Ein Signal verhält sich wie ein `@Value`-Feld, das bei jeder Änderung automatisch alle Abhängigen benachrichtigt.*

---

### 🎯 Directives – Attribute Directives

Attribute Directives kapseln wiederverwendbares DOM-Verhalten, das deklarativ per HTML-Attribut auf beliebige Elemente angewendet wird. Die Komponente selbst enthält keine Styling-Logik – die Direktive übernimmt das vollständig. `Renderer2` wird statt direkter DOM-Manipulation verwendet, weil es Server-Side Rendering (SSR) kompatibel und besser testbar ist.

Im Projekt färbt `PriorityBorderDirective` die linke Kante einer Task-Card je nach Priorität ein. Sie empfängt die Priorität über ein Signal-Input (`input()`) und setzt den Stil über `Renderer2`.

*Spring-Analogie: Custom Annotation + AOP-Aspect – deklarativ anwenden, Verhalten wird automatisch ausgeführt, kein Code in der Hauptklasse nötig.*

---

### 🗃 NGXS State Management

NGXS verwaltet den globalen Anwendungszustand nach dem Redux-Muster mit deutlich weniger Boilerplate als klassisches Redux oder NgRx. Es gibt drei Kernkonzepte: **State** (das Datenmodell mit Event-Handlern), **Actions** (typsichere Befehle die Zustandsänderungen auslösen) und **Selectors** (gecachte, reine Funktionen die Sichten auf den State berechnen).

Jede Zustandsänderung läuft zwingend über eine Action – das macht den Datenfluss vorhersehbar und mit den Redux DevTools in Echtzeit nachvollziehbar. Selektoren werden automatisch invalidiert wenn sich die ihnen zugrunde liegenden State-Teile ändern, und können aufeinander aufbauen (Komposition). In der App werden NGXS-Observables über `toSignal()` in Signals umgewandelt, sodass Templates ohne `async`-Pipe auskommen.

*Spring-Analogie: `@Service` Singleton (State) + `@EventListener` (Action) + JPA Repository Queries (Selector).*

---

### 🌐 HTTP Client & RxJS

Angular's `HttpClient` gibt Observables zurück, die mit RxJS-Operatoren zu Pipelines verkettet werden. Wichtige Operatoren im Projekt: `map()` transformiert die API-Antwort, `catchError()` kapselt Fehler und leitet sie weiter, `retry()` wiederholt einen fehlgeschlagenen Request automatisch, `tap()` ermöglicht Logging ohne den Datenstrom zu verändern.

Für reaktive UI-Eingaben (z. B. das Suchfeld) ist `debounceTime()` entscheidend – es wartet eine kurze Zeit nach der letzten Eingabe bevor der Store benachrichtigt wird, um unnötige Dispatches zu vermeiden. `distinctUntilChanged()` verhindert doppelte Dispatches wenn sich der Wert nicht wirklich geändert hat. `takeUntilDestroyed()` sorgt für automatisches Cleanup der Subscription ohne manuelles `ngOnDestroy`.

*Spring-Analogie: WebClient (reaktiv) mit Flux-Operatoren wie `map()`, `onErrorResume()` und `retryWhen()`.*

---

### 🔒 HTTP Interceptor

Ein funktionaler HTTP Interceptor (Angular 15+) ist eine einfache Funktion vom Typ `HttpInterceptorFn`, die jeden ausgehenden Request abfängt, bevor er den Server erreicht, und jede Antwort verarbeitet bevor sie die aufrufende Stelle erreicht. So lässt sich globales Verhalten – Logging, Auth-Header, Lade-Indikatoren – zentral implementieren, ohne dass einzelne Services davon wissen müssen.

Im Projekt startet der `loadingInterceptor` den `LoadingService` bei jedem Request und stoppt ihn via `finalize()` garantiert nach Abschluss, unabhängig davon ob der Request erfolgreich war oder fehlschlug. Der `LoadingService` zählt parallel laufende Requests mit einem Zähler, sodass der Spinner nur verschwindet wenn wirklich alle Anfragen abgeschlossen sind.

*Spring-Analogie: `HandlerInterceptor.preHandle()` für den Request und `afterCompletion()` für den finalen Cleanup.*

---

### 🔀 Route Resolver

Ein Route Resolver ist eine Funktion (`ResolveFn`), die der Angular Router vor dem Aktivieren einer Route aufruft und auf deren Abschluss wartet. Die Komponente rendert erst, wenn der Resolver fertig ist – es gibt keinen leeren Zustand oder ein kurzes Aufblitzen ohne Daten.

Im Projekt prüft der `tasksResolver` ob der NGXS-Store bereits Tasks enthält (`selectSnapshot`). Ist er leer, dispatcht er `LoadTasksFromApi` und wartet auf das Ergebnis. So wird die API nur einmal aufgerufen, auch wenn der Nutzer mehrfach zur Route navigiert. Lazy Loading der Komponente und Resolver arbeiten dabei parallel, was die Ladezeit minimiert.

*Spring-Analogie: `@ModelAttribute`-Methode im Controller oder ein Before-AOP-Advice, der Daten bereitstellt bevor der eigentliche Handler läuft.*

---

### 📝 Reactive Forms & FormBuilder

Reactive Forms definieren die Formularstruktur vollständig in der TypeScript-Klasse – nicht im Template. Der `FormBuilder` erzeugt typsichere `FormGroup`-Instanzen mit Validatoren. Validierungsfehler sind synchron verfügbar; kein async-Pipe, keine Subscription nötig.

Signals und Reactive Forms ergänzen sich gut: Ein `submitted`-Signal steuert wann Fehlermeldungen angezeigt werden (erst nach dem ersten Submit-Versuch, nicht schon beim Tippen). `computed()`-Signals können Formularwerte ableiten, z. B. einen Zeichenzähler für ein Textfeld. Custom Validators sind reine Funktionen, die auf externe Abhängigkeiten wie den NGXS-Store zugreifen können.

*Spring-Analogie: `@Valid` annotiertes DTO mit `BindingResult` – aber reaktiv und ohne HTTP-Request-Lifecycle.*

---

### 🖱 CDK Drag & Drop

Das Angular CDK (Component Dev Kit) stellt Low-Level-Primitiven bereit, die keine eigene UI-Bibliothek vorschreiben. `cdkDropListGroup` verbindet mehrere `cdkDropList`-Container so, dass Elemente zwischen ihnen verschoben werden können. Jedes draggbare Element trägt `cdkDrag` und übergibt seine Daten über `cdkDragData`.

Beim Loslassen eines Elements feuert `cdkDropListDropped` mit vollständigen Informationen über Quell- und Zielliste sowie Index. Die Komponente dispatcht daraufhin eine NGXS-Action um den Task-Status zu aktualisieren – die UI folgt automatisch über die reaktiven Selektoren.

---

## Workshop-Agenda

| Zeit  | Dauer | Typ         | Inhalt                                                        |
|-------|-------|-------------|---------------------------------------------------------------|
| 00:00 | 15'   | Theorie     | Intro, Architektur, Spring → Angular Mapping                  |
| 00:15 | 15'   | Theorie     | Signals: `signal()`, `computed()`, `effect()`, `toSignal()`   |
| 00:30 | 10'   | Theorie     | Directives: Attribute Directive, `ElementRef`, `Renderer2`    |
| 00:40 | 20'   | **Übung 1** | Signals + eigene Directive                                    |
| 01:00 | 10'   | **Pause**   |                                                               |
| 01:10 | 20'   | Theorie     | NGXS: State, Actions, Selectors, Redux DevTools               |
| 01:30 | 15'   | **Übung 2** | NGXS: neue Action + Selector + Progress-Bar                   |
| 01:45 | 20'   | Theorie     | HTTP + Interceptor + RxJS-Operatoren                          |
| 02:05 | 15'   | **Übung 3** | `tap`, `retry`, Interceptor-Logging, async/await              |
| 02:20 | 5'    | Theorie     | Route Resolver                                                |
| 02:25 | 5'    | **Pause**   |                                                               |
| 02:30 | 15'   | Theorie     | Reactive Forms, FormBuilder, Validierung + Signals            |
| 02:45 | 20'   | **Übung 4** | Custom Validator, Zeichenzähler, Signal+Form                  |
| 03:05 | 10'   | Theorie     | CDK Drag & Drop                                               |
| 03:15 | 10'   | **Übung 5** | Drop-Zone Guard + visuelles Highlight                         |
| 03:25 | 10'   | Bonus       | Angular Migrations: `ng generate @angular/core:signal-inputs` |
| 03:35 | 10'   | Abschluss   | Key Takeaways, Ressourcen, Q&A                                |

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
├── guide/guide.md                        # Leitfaden für Workshop-Leiter
└── exercises/                            # 6 Übungen (exercise-01 bis exercise-06)
```

---

## Tech Stack

| Technologie | Version | Zweck                                                    |
|-------------|---------|----------------------------------------------------------|
| Angular     | 21.2.0  | Framework (Standalone Components, Signals, Control Flow) |
| NGXS Store  | 21.0.0  | State Management                                         |
| RxJS        | 7.8.2   | Reaktive Programmierung                                  |
| Angular CDK | 21.2.0  | Drag & Drop                                              |
| Bootstrap   | 5.3.8   | Styling (via npm)                                        |
| TypeScript  | 5.9.3   | Sprache                                                  |
| Vitest      | 4.x     | Unit Tests                                               |

---

## Spring Boot → Angular Analogien

| Spring Boot                | Angular                               | Beschreibung              |
|----------------------------|---------------------------------------|---------------------------|
| `@SpringBootApplication`   | `bootstrapApplication()`              | Anwendungs-Einstiegspunkt |
| `@Component` (Bean)        | `@Component` (Standalone)             | Verwaltete Klasse         |
| `@Service`                 | `@Injectable({ providedIn: 'root' })` | Singleton Service         |
| `@Autowired`               | `inject()` Funktion                   | Dependency Injection      |
| `ApplicationContext`       | Angular DI Container                  | IoC Container             |
| `@EventListener`           | NGXS `@Action`                        | Event-Handler             |
| JPA Repository             | NGXS `@Selector`                      | Datenzugriff-Schicht      |
| `Mono<T>` / `Flux<T>`      | `Observable<T>` / `Signal<T>`         | Reaktive Typen            |
| `HandlerInterceptor`       | `HttpInterceptorFn`                   | Request-Lifecycle         |
| `@ModelAttribute`          | `ResolveFn` (Route Resolver)          | Daten vor dem Render      |
| `@Valid` + `BindingResult` | `FormBuilder` + `Validators`          | Formularvalidierung       |
| Custom Annotation + AOP    | `@Directive` + `Renderer2`            | Deklaratives Verhalten    |

---

## Angular Migrations

Angular CLI bietet Schematics um bestehenden Code automatisch zu modernisieren – analog zu **OpenRewrite** in der Java-Welt.

```bash
# Vorschau (kein Code wird geändert)
npx ng generate @angular/core:<migration> --dry-run

# Ausführen
npx ng generate @angular/core:<migration>
```

| Migration                | Was wird modernisiert                                     |
|--------------------------|-----------------------------------------------------------|
| `signal-inputs`          | `@Input()` → `input()`                                    |
| `outputs`                | `@Output() EventEmitter` → `output()`                     |
| `signal-queries`         | `@ViewChild/@ContentChild` → `viewChild()/contentChild()` |
| `inject-function`        | Konstruktor-Injection → `inject()`                        |
| `standalone`             | NgModule-Apps → Standalone Components                     |
| `control-flow`           | `*ngIf`/`*ngFor` → `@if`/`@for`                           |
| `route-lazy-loading`     | Eager Routes → Lazy-loaded Routes                         |
| `self-closing-tags`      | `<comp></comp>` → `<comp />`                              |
| `cleanup-unused-imports` | Ungenutzte Imports entfernen                              |

> **Hinweis:** In diesem Projekt wurden `signal-inputs` und `outputs` bereits automatisch durch den Linter angewendet.

---

## Ressourcen

- [angular.dev](https://angular.dev) – Offizielle Angular Dokumentation
- [ngxs.io](https://www.ngxs.io) – NGXS Dokumentation
- [rxjs.dev](https://rxjs.dev) – RxJS Dokumentation
- [angular.dev/reference/migrations](https://angular.dev/reference/migrations) – Angular Migrations
- [material.angular.io/cdk](https://material.angular.io/cdk/categories) – Angular CDK
