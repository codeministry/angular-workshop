# Facilitator-Leitfaden – Angular Workshop

## Für wen ist dieser Leitfaden?

Für die Person die den Workshop hält. Enthält Timing-Hinweise, Antworten auf häufige Fragen, Troubleshooting und Recovery-Pläne.

---

## Pre-Workshop Checkliste (1 Woche vorher)

- [ ] Node.js ≥ 22 auf allen Teilnehmer-Rechnern installiert
- [ ] `npm install` im Projektverzeichnis ausgeführt
- [ ] `npm start` läuft ohne Fehler (`http://localhost:4200`)
- [ ] Chrome mit **Redux DevTools Extension** installiert
- [ ] Angular Language Service Extension in VS Code installiert
- [ ] Netzwerkzugang zu `jsonplaceholder.typicode.com` vorhanden
  - Falls nicht: `json-server` als lokaler Fallback vorbereiten (siehe Abschnitt "Offline-Modus")

---

## Setup-Kurzreferenz

```bash
# Projekt starten
cd wokshop4devs
npm start
# → http://localhost:4200

# Tests ausführen
npm test

# Build prüfen
npx ng build --configuration=development
```

---

## Spring Boot → Angular Analogien (Kurzreferenz für Fragen)

| Spring Boot | Angular | Erklärung |
|---|---|---|
| `@SpringBootApplication` | `bootstrapApplication()` | App-Einstiegspunkt |
| `@Component` Bean | `@Component` standalone | Verwaltete Klasse |
| `@Service` | `@Injectable({ providedIn:'root' })` | Singleton |
| `@Autowired` | `inject()` | Dependency Injection |
| `ApplicationContext` | Angular DI Container | IoC Container |
| `@EventListener` | NGXS `@Action` | Event-Verarbeitung |
| JPA Repository | NGXS `@Selector` | Datenzugriff-Schicht |
| `Flux<T>` / `Mono<T>` | `Observable<T>` / `Signal<T>` | Reaktive Typen |
| `HandlerInterceptor` | `HttpInterceptorFn` | Request-Lifecycle |
| `@ModelAttribute` | `ResolveFn` (Resolver) | Daten vor dem Render |
| `@Valid` + `BindingResult` | `FormBuilder` + `Validators` | Formularvalidierung |

---

## Modulweise Facilitator-Notizen

### Modul 1: Intro & Architektur (15 Min)

**Ziel:** Vertrauen schaffen. Die Teilnehmer sollen verstehen dass Angular dieselben Konzepte wie Spring kennt – nur andere Namen.

**Einstieg (2 Min) – Publikum abholen:**
> "Wer von euch hat schon mal einen Spring `@Service` geschrieben? Und `@Autowired` benutzt? Gut. Dann kennt ihr bereits 80% der Angular-Architektur – nur unter anderen Namen."

Schreib an die Tafel / Whiteboard die zwei Spalten und füll sie live aus während du redest:

```
Spring Boot          Angular
──────────────       ──────────────────────
@Service             @Injectable
@Autowired           inject()
ApplicationContext   DI Container
@EventListener       NGXS @Action
JPA Repository       NGXS @Selector
HandlerInterceptor   HttpInterceptorFn
```

**Live-Demo: App starten und zeigen (5 Min)**

Zeige die laufende App auf `http://localhost:4200`:
1. Board mit 3 Spalten → "Das ist unser Ziel. Diese App ist schon fertig – ihr seht was wir bauen."
2. Task per Drag & Drop verschieben → "Alles was ihr heute lernt, ist in dieser App verbaut."
3. Chrome DevTools → Netzwerk-Tab → "Sieht ihr den GET-Request? Das ist unser HTTP-Client-Modul."
4. Redux DevTools öffnen → Tab anklicken → "Das ist der NGXS Store. Jede Aktion wird protokolliert."

**Projektstruktur zeigen (5 Min)**

Öffne VS Code, zeige die Ordnerstruktur und erkläre die Analogie:

```
src/app/
├── core/           ← "Wie eure @Service und @Repository Klassen in Spring"
│   ├── services/   ← "Singletons, providedIn: 'root'"
│   ├── models/     ← "Eure DTOs und Entities"
│   └── interceptors/ ← "HandlerInterceptor – greift in jeden HTTP-Request ein"
├── store/          ← "Der globale Zustand – wie ein In-Memory ApplicationContext"
│   ├── task.state.ts    ← "@Service mit @EventListener"
│   ├── task.actions.ts  ← "Typsichere Event-Klassen"
│   └── task.selectors.ts ← "JPA-Repository-Query-Methoden"
└── features/kanban/ ← "Eure Controller und Views"
```

**Häufige Fragen:**
- *"Brauchen wir noch NgModule?"* → Nein! Seit Angular 17 sind Standalone Components der Standard. Kein `NgModule` mehr nötig. Jede Component/Directive/Pipe importiert ihre Abhängigkeiten selbst.
- *"Was ist der Unterschied zu React/Vue?"* → Angular ist **opinionated**: es hat eingebaute Lösungen für DI, Routing, Forms, HTTP. React ist nur View-Bibliothek – ihr wählt selbst jeden weiteren Baustein.
- *"Warum TypeScript?"* → Angular wurde für TypeScript entwickelt. Typsicherheit gibt euch refactoring-sichere Code-Basis, genau wie in Java. Ohne TypeScript würde Angular seinen Mehrwert verlieren.

**Troubleshooting:**
- App startet nicht → `npm install` nochmal ausführen, dann `npm start`
- Port 4200 belegt → `npx ng serve --port 4201`

---

### Modul 1b: Signals (15 Min)

**Kernpunkt:** Signals sind nicht kompliziert – sie sind "smarte" Werte mit automatischem Dependency-Tracking.

**Einstieg (1 Min):**
> "Wer kennt das: Eine Variable ändert sich im Service, aber die UI aktualisiert sich nicht? Oder umgekehrt: Alles rendert neu obwohl sich gar nichts geändert hat? Das ist das Zone.js-Problem. Signals lösen das elegant."

**Live-Demo-Sequenz (12 Min):**

1. **Zone.js-Problem zeigen** (2 Min):
   Öffne `kanban-board.component.ts`. Erkläre kurz: "Aktuell nutzt Angular Zone.js im Hintergrund. Signals ersetzen das schrittweise."

2. **`signal()` live in der App** (3 Min):
   ```typescript
   // In KanbanBoardComponent – bereits vorhanden!
   readonly showForm = signal(false);
   ```
   Im Template `showForm()` mit Klammern zeigen. Taste `F12` → "Neue Task" Button klicken → `showForm()` ändert sich. **Pointe:** Kein `ChangeDetectorRef`, kein `detectChanges()`!

3. **`computed()` umwandeln** (3 Min):
   ```typescript
   // Vorher: regulärer Getter
   get completionPercent() { return Math.round(...) }

   // Nachher: computed Signal (gecacht!)
   readonly completionPercent = computed(() => {
     const count = this.taskCount();
     return count.total > 0 ? Math.round((count.done / count.total) * 100) : 0;
   });
   ```
   Betonen: `computed()` wird **nur neu berechnet** wenn `taskCount()` sich ändert. Memoization out of the box!

4. **`effect()` für Logging** (2 Min):
   ```typescript
   constructor() {
     effect(() => console.log('Formular:', this.showForm()));
   }
   ```
   Browser-Konsole öffnen, Formular öffnen/schließen. Angular trackt `showForm()` automatisch.

5. **`toSignal()` – NGXS-Bridge** (1 Min):
   ```typescript
   readonly todoTasks = toSignal(
     this.store.select(TaskSelectors.todoTasks), { initialValue: [] }
   );
   ```
   Zeigen: kein `async`-Pipe im Template nötig. `todoTasks()` direkt verwenden.

6. **`input()` als Signal** (1 Min):
   Öffne `kanban-column.component.ts`. Zeigen: `readonly tasks = input.required<Task[]>()`. Template: `tasks()` mit Klammern. "Das gleiche Prinzip – Signal-Input ist auch eine Funktion!"

**Spring-Analogien pro Konzept:**

| Signal-Konzept | Spring-Analogie |
|---|---|
| `signal(value)` | `AtomicReference<T>` – Thread-sicherer reaktiver Wert |
| `computed()` | `@Transient` berechnetes JPA-Feld / Guava Cache |
| `effect()` | `@EventListener(ApplicationEvent)` – reagiert auf Zustandsänderungen |
| `toSignal(obs$)` | `Mono.toFuture()` – Konvertierung zwischen reaktiven Typen |
| `input.required<T>()` | `@Value` Pflicht-Property in einer Spring-Bean |

**Häufige Missverständnisse von Java-Entwicklern:**

| Missverständnis | Richtigstellung |
|---|---|
| "Signal ist wie ein Optional" | Nein! Signal hält immer einen Wert. Es geht um *Reaktivität*, nicht Nullsicherheit. |
| "Ich muss Subscribe aufrufen" | Nein! Signals in Templates und `computed()`/`effect()` sind automatisch reaktiv. |
| "computed() ist wie ein synchronized Getter" | Ähnlich, aber lazy und gecacht – wird nur ausgeführt wenn Abhängigkeiten sich ändern. |
| "effect() kann State mutieren" | ⚠️ Nicht empfohlen! `effect()` für Seiteneffekte (Logging, DOM), nie für Berechnungen. |
| "input() muss mit ngOnChanges synchronisiert werden" | Signal-Inputs triggern `ngOnChanges` automatisch – dasselbe Verhalten wie `@Input()`. |

**Häufige Fragen:**
- *"Wann Signals, wann Observables?"* → Signals für UI-State und abgeleitete Werte. Observables für Datenströme (HTTP, WebSockets, NGXS). `toSignal()` / `toObservable()` verbinden beides.
- *"Ist Zone.js jetzt obsolet?"* → Nicht sofort. In Angular 18+ kann man `provideZoneChangeDetection({ eventCoalescing: true })` oder vollständig zoneless arbeiten. Signals sind der erste Schritt.
- *"Warum sind Signal-Inputs `readonly`?"* → Kind-Komponenten dürfen Input-Werte nicht mutieren – das ist eine Eltern-Verantwortung. `readonly` erzwingt das zur Compile-Zeit.

**Troubleshooting:**

| Symptom | Ursache | Lösung |
|---|---|---|
| Template zeigt `[object Object]` statt Wert | Signal ohne `()` aufgerufen | `count()` statt `count` |
| `effect()` wirft Fehler "must be called in injection context" | `effect()` außerhalb des Konstruktors | In `constructor() { effect(() => ...) }` verschieben |
| `computed()` aktualisiert sich nicht | Abhängigkeits-Signal nicht mit `()` gelesen | `this.mySignal()` – den Signal-Wert im computed lesen! |
| `toSignal()` gibt `undefined` zurück | `initialValue` fehlt | `toSignal(obs$, { initialValue: [] })` |
| Input-Property in Template ohne Klammern | Signal-Input vergessen → zeigt Signal-Funktion statt Wert | `tasks()` statt `tasks` |

---

### Modul 1c: Directives (10 Min)

**Kernpunkt:** Directives kapseln wiederverwendbares DOM-Verhalten ohne Logik in der Komponente.

**Einstieg (1 Min):**
> "Stellt euch vor ihr wollt jeden Task-Card einen farbigen linken Rahmen geben – je nach Priorität. Ihr könntet die Logik in TaskCardComponent schreiben. Aber dann ist sie dort gefangen. Mit einer Directive macht ihr dasselbe deklarativ und wiederverwendbar in jeder Komponente."

**Live-Demo: PriorityBorderDirective (7 Min)**

1. **Directive öffnen** – `src/app/shared/directives/priority-border.directive.ts`:
   ```typescript
   @Directive({
     selector: '[appPriorityBorder]',   // Verwendet wie ein HTML-Attribut
     standalone: true,
   })
   export class PriorityBorderDirective implements OnChanges {
     // Signal-Input mit Alias – der HTML-Attributname = der Signal-Name
     readonly priority = input<TaskPriority>('low', { alias: 'appPriorityBorder' });

     private readonly el = inject(ElementRef);      // Referenz zum DOM-Element
     private readonly renderer = inject(Renderer2); // Abstrahierter DOM-Zugriff

     ngOnChanges(): void {
       this.renderer.setStyle(
         this.el.nativeElement, 'border-left',
         `4px solid ${this.colorMap[this.priority()]}` // Signal mit () lesen!
       );
     }
   }
   ```

2. **Verwendung zeigen** – in `task-card.component.html`:
   ```html
   <div class="card" [appPriorityBorder]="task().priority">
   ```
   → "Einzeilig. Kein Code in TaskCardComponent. Die Directive ist wiederverwendbar."

3. **ElementRef vs. Renderer2 erklären:**
   - `ElementRef.nativeElement` = direkter Zugriff auf das DOM-Element (wie `document.getElementById`)
   - `Renderer2` = abstrakter Adapter, funktioniert auch in SSR (Server-Side Rendering) und WebWorkers
   - **Faustregel:** Immer `Renderer2`, nie `element.style.xxx = ...` direkt

4. **Spring-Analogie live einblenden:**
   > "Das ist wie eine Custom Annotation + AOP-Aspect in Spring. Die Annotation deklariert das Verhalten (`[appPriorityBorder]`), der Aspect setzt es um (`PriorityBorderDirective`). Die Business-Klasse weiß nichts davon."

**Häufige Fragen:**
- *"Wann Directive, wann Component?"*
  → Component = hat eigenes Template (HTML). Directive = kein Template, verändert nur das Element auf dem sie sitzt.
  → Beispiel: Ein Button-Spinner wäre eine Component. Ein Tooltip-Effekt wäre eine Directive.
- *"Warum Renderer2 und nicht direkt `element.style =`?"*
  → SSR-Kompatibilität: Im Server-Side Rendering gibt es kein DOM. Renderer2 abstrahiert das weg. Außerdem: Unit Tests können Renderer2 mocken, direkter DOM-Zugriff nicht.
- *"Warum `ngOnChanges` und nicht `effect()`?"*
  → Beide funktionieren! `ngOnChanges` ist der klassische Angular-Lifecycle. Bei Signal-Inputs würde `effect()` im Konstruktor auch gehen: `effect(() => this.applyStyle(this.priority()))`. Für diesen Fall ist `ngOnChanges` vertrauter und direkter.
- *"Structural Directives – wo sind die?"*
  → `@if`, `@for`, `@switch` in den Templates sind die modernen Built-in Structural Directives. Eigene Structural Directives (mit `TemplateRef`) sind selten – zeigen wir heute nicht.

**Troubleshooting:**
- Directive zeigt keine Farbe → `ngOnChanges` prüfen: wird sie aufgerufen? `priority()` mit `()` lesen?
- `ERROR NullInjectorError: No provider for ElementRef` → Directive muss im `imports`-Array der Component stehen

---

### Übung 1 (20 Min)

**Erwartetes Ergebnis:** Teilnehmer haben `effect()`, `computed()` und Signal-Inputs verstanden und eine eigene Directive erstellt – alles in der laufenden Kanban-App nachvollziehbar.

**Aufgaben im Überblick:**
1. `effect()` in `KanbanBoardComponent` – `showForm`-Signal beobachten
2. `completionPercent` getter → `computed()` Signal umwandeln
3. `input.required<T>()` in `KanbanColumnComponent` lesen und verstehen
4. `HighlightDirective` erstellen und leere Spalten markieren
5. **Bonus:** `toObservable()` – Signal → Observable

**Häufige Probleme:**
- Signal wird ohne `()` im Template aufgerufen → `tasks()` statt `tasks`, `columnId()` statt `columnId`
- `effect()` außerhalb des Konstruktors → Error! Muss in `constructor()` oder Injection-Context
- `computed` vergessen zu importieren → `import { Component, computed, effect, inject, signal }`
- `HighlightDirective` nicht in `imports` → TypeScript-Fehler "Unknown directive"
- `active()` in Directive vergessen mit `()` → gibt Signal-Funktion zurück, nicht Boolean

**Recovery bei Zeitnot:** Aufgaben 1-3 sind Pflicht, 4 optional, 5 nur für Schnelle.

---

### Modul 2: NGXS (20 Min)

**Kernpunkt:** NGXS = Spring `@Service` + JPA-Repository + `@EventListener` in einem einzigen Pattern.

**Einstieg (2 Min):**
> "Stellt euch vor: Ihr habt eine Spring-App mit einem `TaskService`, der alle Tasks als In-Memory-Liste hält. Jede Controller-Methode ruft `taskService.addTask()` oder `taskService.getTasks()` auf. Was passiert wenn 10 Komponenten denselben Service haben und Tasks ändern? Ihr verliert den Überblick. NGXS macht genau das – aber mit einem formalen Protokoll: Actions sind typsichere Methodenaufrufe, und jede Änderung wird protokolliert."

**Das NGXS-Dreieck erklären (3 Min):**

Zeichne live an die Tafel:
```
   [Komponente]
    dispatches ↓         ↑ selects (Observable/Signal)
   [Action]  →  [State / @Action Handler]  →  [Selector]
                  (verändert State)           (liest State)
```

Erkläre mit Spring-Parallele:
- **Action** = Methodenaufruf-Event (wie `ApplicationEvent` in Spring)
- **@Action Handler** = `@EventListener`-Methode die reagiert
- **State** = der Datenspeicher (wie ein In-Memory JPA-Repository)
- **@Selector** = Repository-Query-Methode (findet gefilterte Daten)

**Live-Demo-Sequenz (13 Min):**

1. **Store-Konfiguration zeigen** (1 Min) – `src/app/app.config.ts`:
   ```typescript
   provideStore(
     [TaskState],                          // Welche States gibt es?
     withNgxsReduxDevtoolsPlugin(),        // Redux DevTools aktivieren
   )
   ```
   → "Wie `@Bean`-Registrierung im ApplicationContext."

2. **Redux DevTools öffnen** (2 Min):
   - Chrome DevTools → Tab "Redux" öffnen
   - App neu laden → `[Task] Load From API` und `[Task] Load Tasks Success` sehen
   - State-Baum anklicken → `tasks: [...]` array zeigen
   - **Pointe:** "Jede Zustandsänderung ist sichtbar, nachvollziehbar und zeitreisbar."

3. **Actions anschauen** (2 Min) – `src/app/store/task.actions.ts`:
   ```typescript
   export class AddTask {
     static readonly type = '[Task] Add';  // Eindeutiger Action-Name
     constructor(public payload: Omit<Task, 'id' | 'createdAt'>) {}
   }
   ```
   → "Das ist wie ein typsicheres Event-Objekt. `type` ist der Event-Name, den DevTools anzeigen."

4. **State & @Action Handler** (4 Min) – `src/app/store/task.state.ts`:
   ```typescript
   @State<TaskStateModel>({
     name: 'tasks',
     defaults: { tasks: [], filter: '', selectedPriority: 'all', error: null }
   })
   @Injectable()
   export class TaskState {
     @Action(AddTask)                          // Reagiert auf AddTask-Event
     addTask(ctx: StateContext<TaskStateModel>, action: AddTask) {
       const newTask: Task = {
         ...action.payload,
         id: crypto.randomUUID(),
         status: 'todo',
         createdAt: new Date().toISOString(),
       };
       ctx.patchState({ tasks: [...ctx.getState().tasks, newTask] });
                        // ↑ Immutable Update! Wie Collections.unmodifiableList() in Java
     }
   }
   ```
   → "Der Handler ersetzt nie direkt das Array – er erstellt immer ein neues. Das ermöglicht Time-Travel im DevTools."

5. **Selector zeigen** (2 Min) – `src/app/store/task.selectors.ts`:
   ```typescript
   @Selector([TaskSelectors.filteredTasks])
   static todoTasks(filteredTasks: Task[]): Task[] {
     return filteredTasks.filter(t => t.status === 'todo');
   }
   ```
   → "Composition: `todoTasks` basiert auf `filteredTasks`, das basiert auf `allTasks`. Wie JOIN-Queries in JPA."

6. **Live: Task hinzufügen** (2 Min):
   - Formular öffnen, Task ausfüllen, absenden
   - DevTools: `[Task] Add` → State danach anschauen
   - → "Alles nachvollziehbar. Kein Debugging im Service mehr nötig."

**Spring-Analogien als Tabelle:**

| NGXS-Konzept | Spring-Analogie |
|---|---|
| `@State` | `@Service` + In-Memory Repository |
| `@Action(AddTask)` | `@EventListener(AddTaskEvent.class)` |
| `ctx.patchState()` | `entity.setField()` + `repository.save()` |
| `ctx.getState()` | `repository.findAll()` |
| `@Selector` | Repository-Query-Methode (`findByStatus`) |
| `store.dispatch(new AddTask(...))` | `applicationEventPublisher.publishEvent(new AddTaskEvent(...))` |
| `store.selectSnapshot()` | Synchroner Repository-Call (kein Reactive) |

**Häufige Missverständnisse:**

| Missverständnis | Richtigstellung |
|---|---|
| "Ich muss alles in den Store" | Nein! UI-State (Formular offen?, Hover-State) gehört als lokales `signal()` in die Komponente |
| "State ist wie eine Datenbank" | State ist In-Memory – wird bei Page-Reload zurückgesetzt. Persistenz braucht localStorage oder Backend |
| "patchState() mutiert das Objekt" | Nein! NGXS erzeugt intern immer ein neues State-Objekt (Immutability) |
| "@Selector muss alle Tasks kennen" | Nein! Selektoren können andere Selektoren als Input nutzen (Composition) |

**Häufige Fragen:**
- *"NGXS vs NgRx?"*
  → NGXS: Decorator-basiert, weniger Boilerplate, ähnlich Spring – ideal für diesen Workshop.
  NgRx: Funktional, größere Community, näher an Redux-Pattern. Beide sind production-ready.
- *"Wann brauche ich einen Store, wann reicht ein Service?"*
  → Store wenn: mehrere nicht-verwandte Komponenten dieselben Daten brauchen. Service wenn: Daten nur lokal in einer Feature-Area gebraucht werden.
- *"Kann ich den Store persistieren?"*
  → Ja! `@ngxs/storage-plugin` serialisiert den Store in `localStorage`. Nicht im Workshop, aber erwähnenswert.

**Troubleshooting:**

| Symptom | Ursache | Lösung |
|---|---|---|
| `No provider for Store` | `provideStore()` fehlt in `app.config.ts` | `provideStore([TaskState])` hinzufügen |
| `@State` not found | NGXS-Import vergessen | `import { State } from '@ngxs/store'` |
| Redux DevTools zeigen nichts | Plugin nicht konfiguriert | `withNgxsReduxDevtoolsPlugin()` in `provideStore()` |
| Action dispatcht, State ändert sich nicht | `@Action`-Decorator fehlt oder falscher Action-Typ | `@Action(MeineAction)` vor der Handler-Methode |
| `ctx.patchState()` – TypeScript-Fehler | Falscher Feld-Name im State-Objekt | State-Interface prüfen: `TaskStateModel` |

---

### Übung 2 (15 Min)

**Erwartetes Ergebnis:** Teilnehmer haben eine neue Action `ToggleTaskStatus` erstellt, einen Handler im State, einen `completionPercent`-Selector, und zeigen ihn in einer Progress-Bar.

**Schritt-für-Schritt für schnelle Hilfe:**

1. Action in `task.actions.ts` hinzufügen:
   ```typescript
   export class ToggleTaskStatus {
     static readonly type = '[Task] Toggle Status';
     constructor(public taskId: string, public currentStatus: TaskStatus) {}
   }
   ```

2. Handler in `task.state.ts` hinzufügen:
   ```typescript
   @Action(ToggleTaskStatus)
   toggleTaskStatus(ctx: StateContext<TaskStateModel>, action: ToggleTaskStatus) {
     const next: TaskStatus = action.currentStatus === 'done' ? 'todo' : 'done';
     const tasks = ctx.getState().tasks
       .map(t => t.id === action.taskId ? { ...t, status: next } : t);
     ctx.patchState({ tasks });
   }
   ```

3. Selector in `task.selectors.ts`:
   ```typescript
   @Selector([TaskState])
   static completionPercent(state: TaskStateModel): number {
     const total = state.tasks.length;
     if (total === 0) return 0;
     return Math.round((state.tasks.filter(t => t.status === 'done').length / total) * 100);
   }
   ```

**Häufige Probleme:**
- `ToggleTaskStatus` nicht importiert in der Komponente → TypeScript: `is not a constructor`
- Selector gibt `NaN` zurück → Division durch null wenn tasks leer: `if (total === 0) return 0`
- Redux DevTools zeigen `[Task] Toggle Status` nicht → `withNgxsReduxDevtoolsPlugin()` in app.config.ts prüfen
- Progress-Bar bleibt leer → `toSignal()` mit `initialValue: 0` ergänzen

**Recovery bei Zeitnot:** Selector-Teil als fertig erklären, Teilnehmer zeigen nur die Action + Handler.

---

### Modul 3: HTTP + Interceptor + RxJS (20 Min)

**Kernpunkt:** RxJS = deklarative Verarbeitungspipeline für asynchrone Daten. Der Interceptor ist ein Cross-Cutting Concern – wie AOP in Spring.

**Einstieg (1 Min):**
> "Wer kennt Spring WebFlux? `Flux<T>` und `Mono<T>` sind Observables. RxJS ist dasselbe Konzept im Browser – nur mit anderen Operator-Namen. Wer WebFlux versteht, versteht RxJS."

**RxJS Marble-Diagram live an der Tafel (3 Min):**

```
Quelle:         --A----B----C----D-->
map(toUpper):   --A'---B'---C'---D'-->   (jeden Wert transformieren)
filter(≠ 'B'): --A'--------C'---D'-->   (Werte filtern)
debounce(300):  ------B'---------D'-->   (nur den letzten Wert einer Burst-Serie)
```

> "Stellt euch vor ihr tippt in ein Suchfeld. Ohne debounce: für jeden Buchstaben ein HTTP-Request. Mit debounce: nur wenn 300ms keine neue Eingabe kommt."

**Live-Demo: TaskApiService + HTTP-Pipeline (5 Min)**

Öffne `src/app/core/services/task-api.service.ts`:
```typescript
fetchTodos(): Observable<TodoApiItem[]> {
  return this.http.get<TodoApiItem[]>(`${this.baseUrl}/todos`).pipe(
    catchError(err => {
      console.error('[TaskApiService] Fehler:', err);
      return throwError(() => new Error('Aufgaben konnten nicht geladen werden'));
    }),
  );
}
```

Erkläre jeden Teil:
- `http.get<T>()` → gibt ein Observable zurück, sendet den Request erst wenn jemand subscribt
- `.pipe()` → Operatoren-Kette wie ein Stream-Builder in Java
- `catchError()` → wie ein `try-catch`-Block im Stream

**Live-Demo: Interceptor erklären (5 Min)**

Öffne `src/app/core/interceptors/loading.interceptor.ts`:
```typescript
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);  // inject() funktioniert im Injection-Context

  loadingService.start();   // Lade-Spinner zeigen

  return next(req).pipe(
    finalize(() => loadingService.stop())  // Immer ausführen – egal ob Erfolg oder Fehler
    //                ↑ Wie ein finally-Block in Java
  );
};
```

Spring-Analogie live erklären:
> "Das ist exakt wie `HandlerInterceptor.preHandle()` (start) und `afterCompletion()` (finalize). Nur dass es funktional ist – kein `implements`-Interface nötig."

Registrierung zeigen in `app.config.ts`:
```typescript
provideHttpClient(withInterceptors([loadingInterceptor]))
// ↑ Wie FilterChain in Spring Security – alle Requests laufen durch
```

**Live-Demo: TaskFilterComponent mit debounceTime (4 Min)**

Öffne `src/app/features/kanban/task-filter/task-filter.component.ts`:
```typescript
constructor() {
  this.searchControl.valueChanges.pipe(
    debounceTime(300),       // Wartet 300ms nach letzter Eingabe
    distinctUntilChanged(),  // Nur dispatchen wenn Wert wirklich anders
    takeUntilDestroyed(),    // Automatisches Cleanup wenn Komponente destroyed
  ).subscribe(value => {
    this.store.dispatch(new SetFilter(value ?? ''));
  });
}
```

Live zeigen: Suchfeld tippen → `debounceTime` bewirkt dass erst nach Pause der Store aktualisiert wird.

**Wichtige RxJS-Operatoren im Überblick:**

| Operator | Was er macht | Spring-Analogie |
|---|---|---|
| `map(fn)` | Jeden Wert transformieren | `Stream.map()` |
| `filter(pred)` | Werte herausfiltern | `Stream.filter()` |
| `tap(fn)` | Seiteneffekt ohne Transformation (Logging) | `peek()` in Java Stream |
| `catchError(fn)` | Fehler abfangen, alternatives Observable zurückgeben | `@ExceptionHandler` |
| `retry(n)` | Bei Fehler n-mal wiederholen | Resilience4j `@Retry` |
| `debounceTime(ms)` | Nur letzten Wert nach Pause weitergeben | `@Debounce`-Annotation |
| `distinctUntilChanged()` | Nur bei echten Wertänderungen | `if (!Objects.equals(old, new))` |
| `takeUntilDestroyed()` | Automatisches Unsubscribe beim Destroy | `@PreDestroy` cleanup |
| `finalize(fn)` | Immer ausführen (Erfolg + Fehler) | `finally`-Block |
| `firstValueFrom(obs$)` | Observable → Promise (async/await kompatibel) | `Mono.toFuture()` |

**Häufige Fragen:**
- *"Warum Observable und nicht Promise/async-await?"*
  → Observable = Datenstrom über Zeit (mehrere Werte, cancelbar). Promise = genau ein Wert, nicht cancelbar.
  Aber: Mit `firstValueFrom()` kann man ein Observable in eine Promise umwandeln – async/await funktioniert dann.
- *"Was ist `takeUntilDestroyed`?"*
  → Angular 16+ Alternative zu `ngOnDestroy`. Ohne Cleanup fließen Daten weiter auch wenn die Komponente weg ist (Memory Leak). `takeUntilDestroyed()` abonniert intern `DestroyRef` und beendet das Observable automatisch.
- *"Funktionaler Interceptor vs Klassen-Interceptor?"*
  → Funktional (Angular 15+): direkte Funktion, kein `@Injectable`, weniger Boilerplate. Klassen-basiert (alt): `implements HttpInterceptor`. Beide funktionieren, funktional ist der Standard.
- *"Kann ich mehrere Interceptors haben?"*
  → Ja! `withInterceptors([interceptor1, interceptor2])` – sie werden wie eine Kette ausgeführt.

**Troubleshooting:**

| Symptom | Ursache | Lösung |
|---|---|---|
| HTTP-Request nie gesendet | Observable nicht subscribed | `subscribe()` oder `toSignal()` oder `async`-Pipe |
| `retry()` wirkt nicht | `retry` nach `catchError` platziert | Reihenfolge: `.pipe(retry(2), catchError(...))` |
| `tap()` nicht gefunden | Import fehlt | `import { tap } from 'rxjs'` |
| Memory Leak: `subscribe` nie beendet | Kein Cleanup | `takeUntilDestroyed()` in der Pipe hinzufügen |
| `firstValueFrom()` wirft Fehler | Observable schickt Fehler-Event | `firstValueFrom(obs$.pipe(catchError(...)))` |

---

### Übung 3 (15 Min)

**Erwartetes Ergebnis:** Teilnehmer haben `tap()` und `retry()` in den HTTP-Service eingefügt, den Interceptor mit Timing-Log erweitert, und optional eine async/await Version erstellt.

**Schritt-für-Schritt für schnelle Hilfe:**

1. `tap()` in `task-api.service.ts` hinzufügen:
   ```typescript
   fetchTodos(): Observable<TodoApiItem[]> {
     return this.http.get<TodoApiItem[]>(`${this.baseUrl}/todos`).pipe(
       tap(todos => console.log(`[TaskApiService] ${todos.length} Todos geladen`)),
       retry({ count: 2, delay: 1000 }),   // VOR catchError!
       catchError(err => throwError(() => new Error('Ladefehler')))
     );
   }
   ```

2. Timing-Log im Interceptor (optionaler Bonus):
   ```typescript
   export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
     const loadingService = inject(LoadingService);
     const start = Date.now();
     loadingService.start();
     return next(req).pipe(
       tap(() => console.log(`[Interceptor] ${req.url} → ${Date.now() - start}ms`)),
       finalize(() => loadingService.stop()),
     );
   };
   ```

3. async/await mit `firstValueFrom()` (Bonus):
   ```typescript
   async loadTodosAsync(): Promise<void> {
     const todos = await firstValueFrom(this.taskApiService.fetchTodos());
     this.store.dispatch(new LoadTasksSuccess(todos.slice(0, 15).map(...)));
   }
   ```

**Häufige Probleme:**
- `retry()` nach `catchError()` platziert → Reihenfolge beachten! Retry muss VOR catchError
- `tap` import vergessen → `import { tap, retry, catchError } from 'rxjs'`
- `firstValueFrom` TypeScript-Fehler → `import { firstValueFrom } from 'rxjs'`

**Recovery bei Zeitnot:** `tap()` ist Pflicht, `retry()` optional, async/await Bonus.

---

### Modul 3b: Route Resolver (5 Min)

**Kernpunkt:** Resolver = Wächter der Daten sicherstellt bevor die Komponente rendert.

**Einstieg:**
> "Wer kennt das: Ihr öffnet eine Seite und seht kurz einen leeren Zustand bevor die Daten kommen? Das sieht unprofessionell aus. Ein Resolver löst das: Die Route wartet bis der Resolver fertig ist – die Komponente sieht nie einen leeren State."

**Code-Walkthrough (3 Min) – `src/app/core/resolvers/tasks.resolver.ts`:**
```typescript
export const tasksResolver: ResolveFn<void> = () => {
  const store = inject(Store);

  // selectSnapshot = synchrone Abfrage (kein Observable)
  const existingTasks = store.selectSnapshot(TaskSelectors.allTasks);

  if (existingTasks.length === 0) {
    // Gibt ein Observable zurück – Router wartet auf Completion
    return store.dispatch(new LoadTasksFromApi());
  }

  // Bereits geladen → sofort durchlassen
  return of(undefined);
};
```

Zeige in `app.routes.ts` die Registrierung:
```typescript
{
  path: 'board',
  resolve: { tasks: tasksResolver },    // ← Resolver wird VOR dem Laden der Komponente ausgeführt
  loadComponent: () => import('./features/kanban/kanban-board/kanban-board.component')
    .then(m => m.KanbanBoardComponent)
}
```

**Spring-Analogie:**
> "Wie eine `@ModelAttribute`-Methode im Controller, oder ein Before-AOP-Advice. Die Methode lädt Daten in den `Model`-Context bevor die View gerendert wird. Hier lädt der Resolver Daten in den NGXS-Store bevor die Component rendert."

**Häufige Fragen:**
- *"Unterschied Resolver vs. Guard?"*
  → Guard: entscheidet ob die Route betreten werden darf (`true`/`false`). Resolver: lädt Daten für die Route (gibt immer durch, stellt Daten bereit).
- *"Was passiert wenn der Resolver fehlschlägt?"*
  → Die Navigation bricht ab. Mit `catchError` im Resolver kann man auf eine Fehlerseite umleiten.

---

### Modul 4: Reactive Forms (15 Min)

**Kernpunkt:** FormBuilder = typsichere Formular-Factory mit deklarativer Validierung. Wie `@Valid` + `BindingResult` in Spring MVC.

**Einstieg (1 Min):**
> "Wer hat schon mal ein Spring MVC Formular mit `@Valid` und `BindingResult` gemacht? Angular Reactive Forms sind dasselbe: Validierungsregeln sind im Code definiert, nicht im Template. Typsicher, testbar, und vollständig unter eurer Kontrolle."

**Live-Demo: TaskFormComponent (10 Min)**

Öffne `src/app/features/kanban/task-form/task-form.component.ts`:

1. **FormGroup erstellen mit FormBuilder (3 Min):**
   ```typescript
   // FormBuilder = Factory für FormGroup (typsicher, kein manuelles new FormGroup())
   // Spring-Analogie: @Valid annotiertes DTO
   taskForm = this.fb.group({
     title:    ['', [Validators.required, Validators.minLength(3)]],
     // ↑ Startwert  ↑ Validierungsregeln (Array = mehrere)
     description: [''],
     priority: ['medium' as TaskPriority, Validators.required],
     assignee: [''],
   });
   ```

   Erkläre die Struktur:
   - Erster Wert im Array = Startwert des Feldes
   - Zweiter Wert = Validator oder Validator-Array
   - `Validators.required` = Pflichtfeld (wie `@NotNull` in Bean Validation)
   - `Validators.minLength(3)` = Mindestlänge (wie `@Size(min=3)`)

2. **Signal für Submit-Status (2 Min):**
   ```typescript
   submitted = signal(false);
   ```
   → "Fehler sollen nicht schon beim Öffnen des Formulars angezeigt werden – das wäre schlechte UX. Erst wenn der Nutzer abzuschicken versucht, zeigen wir was fehlt."

   Im Template: `[class.is-invalid]="submitted() && form.title.invalid"`

3. **onSubmit() erklären (2 Min):**
   ```typescript
   onSubmit(): void {
     this.submitted.set(true);          // Fehleranzeige aktivieren

     if (this.taskForm.valid) {         // Nur wenn alle Felder valide
       this.store.dispatch(new AddTask({
         title: this.taskForm.value.title!,
         // ...
       }));
       this.taskForm.reset({ priority: 'medium' });
       this.submitted.set(false);
       this.formClosed.emit();
     }
   }
   ```

4. **Template: reactive binding (3 Min):**
   ```html
   <!-- formGroup verbindet das HTML-Formular mit dem TypeScript-Objekt -->
   <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">

     <input formControlName="title"                         <!-- ← Verbindet Input mit FormControl -->
            [class.is-invalid]="submitted() && taskForm.get('title')?.invalid">

     <!-- Fehlermeldungen -->
     @if (submitted() && taskForm.get('title')?.errors?.['required']) {
       <div class="invalid-feedback">Titel ist Pflichtfeld</div>
     }
   </form>
   ```

**Spring-Analogien:**

| Angular | Spring MVC |
|---|---|
| `fb.group({ title: ['', Validators.required] })` | `@NotNull String title` im DTO |
| `Validators.minLength(3)` | `@Size(min=3)` |
| `taskForm.valid` | `!bindingResult.hasErrors()` |
| `taskForm.get('title')?.errors` | `bindingResult.getFieldError("title")` |
| `submitted = signal(false)` | Manuelle Flag-Variable vor dem Form-Submit |
| Custom `ValidatorFn` | Eigene `ConstraintValidator<T>`-Implementierung |

**Häufige Fragen:**
- *"Template-Driven vs Reactive Forms?"*
  → Template-Driven: Validierung im HTML mit `ngModel`. Einfacher für kleine Formulare, aber schwerer zu testen.
  Reactive: Validierung im TypeScript-Code. Besser testbar, typsicher, besser für komplexe Formulare. In Enterprise: immer Reactive.
- *"Warum `submitted = signal(false)` und nicht direkt `form.dirty`?"*
  → `dirty` wird schon nach dem ersten Keystroke true. Wir wollen Fehler erst nach dem Submit-Versuch zeigen.
- *"Wie teste ich Reactive Forms?"*
  → `FormGroup` kann direkt in Unit Tests instantiiert werden: `const form = component.taskForm; form.setValue({...}); expect(form.valid).toBe(true)`.
- *"Async Validators?"*
  → Möglich! `AsyncValidatorFn` gibt `Observable<ValidationErrors | null>` zurück. Gut für Server-seitige Duplikat-Prüfung.

**Troubleshooting:**

| Symptom | Ursache | Lösung |
|---|---|---|
| `formControlName` wirft Fehler | `ReactiveFormsModule` nicht importiert | `imports: [ReactiveFormsModule]` in Component |
| Validierung greift nicht | Validator-Array falsch geschrieben | `['', [Validators.required]]` – Array in Array! |
| `taskForm.get('title')` ist null | Falscher Feldname | Feldname muss exakt mit `fb.group()` übereinstimmen |
| Custom Validator wird nie ausgeführt | Nicht im `fb.group()` eingetragen | Als dritter Eintrag: `['', [], myValidator]` |
| `toSignal(valueChanges)` = undefined | Kein `initialValue` | `toSignal(form.valueChanges, { initialValue: '' })` |

---

### Übung 4 (20 Min)

**Erwartetes Ergebnis:** Teilnehmer haben `maxLength(100)` hinzugefügt, einen Zeichenzähler mit `computed()`, und einen Custom Validator für Duplikat-Titel.

**Schritt-für-Schritt für schnelle Hilfe:**

1. `maxLength(100)` zum title-Feld hinzufügen in `task-form.component.ts`:
   ```typescript
   title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
   ```

2. Zeichenzähler mit `computed()` (oder `toSignal()` + `computed()`):
   ```typescript
   // toSignal() konvertiert das valueChanges-Observable in ein Signal
   readonly titleValue = toSignal(
     this.taskForm.get('title')!.valueChanges,
     { initialValue: '' }
   );
   // computed() berechnet Länge reaktiv
   readonly titleLength = computed(() => (this.titleValue() ?? '').length);
   ```
   Im Template: `{{ titleLength() }} / 100 Zeichen`

3. Custom Validator für Duplikat-Titel:
   ```typescript
   // Außerhalb der Klasse (reine Funktion mit Closure):
   function noDuplicateTitleValidator(store: Store): ValidatorFn {
     return (control: AbstractControl): ValidationErrors | null => {
       const exists = store.selectSnapshot(TaskSelectors.allTasks)
         .some(t => t.title.toLowerCase() === control.value?.toLowerCase());
       return exists ? { duplicateTitle: true } : null;
     };
   }

   // In der Klasse – Validator ins taskForm einbinden:
   taskForm = this.fb.group({
     title: ['', [Validators.required, Validators.minLength(3),
                  noDuplicateTitleValidator(this.store)]],
     ...
   });
   ```

   Im Template Fehlermeldung:
   ```html
   @if (submitted() && taskForm.get('title')?.errors?.['duplicateTitle']) {
     <div class="invalid-feedback">Dieser Titel existiert bereits!</div>
   }
   ```

**Häufige Probleme:**
- `toSignal(valueChanges)` gibt `undefined` zurück → `initialValue: ''` setzen
- Custom Validator wird nicht ausgelöst → Prüfen ob er im dritten Parameter von `fb.group` steht
- `store.selectSnapshot()` gibt leeres Array → Resolver noch nicht geladen, App neu starten
- `ValidatorFn` Import fehlt → `import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms'`

**Recovery bei Zeitnot:** Nur `maxLength` und Zeichenzähler, Validator als Hausaufgabe.

---

### Modul 5: CDK Drag & Drop (10 Min)

**Kernpunkt:** CDK Drag & Drop liefert Accessibility-konformes, browser-kompatibles Drag & Drop ohne eine Zeile natives DOM-Event-Handling.

**Einstieg (1 Min):**
> "Drag & Drop selbst bauen bedeutet: DragStart, DragOver, DragEnd, Touch-Events, Keyboard-Navigation, Browser-Kompatibilität. CDK macht das alles. Ihr fügt nur noch drei Attribute ins Template."

**Live-Demo: Drag & Drop in der App (4 Min)**

1. **App zeigen:** Task-Card von "Todo" in "In Progress" ziehen → DevTools zeigen `[Task] Update Status`.

2. **Template-Struktur öffnen** – `kanban-board.component.html`:
   ```html
   <!-- cdkDropListGroup verbindet alle Spalten miteinander -->
   <div class="kanban-board" cdkDropListGroup>
     <app-kanban-column columnId="todo"        [tasks]="todoTasks()"        ... />
     <app-kanban-column columnId="in-progress" [tasks]="inProgressTasks()"  ... />
     <app-kanban-column columnId="done"        [tasks]="doneTasks()"        ... />
   </div>
   ```
   → "Ohne `cdkDropListGroup` können Cards nur innerhalb einer Spalte verschoben werden."

3. **Spalten-Template** – `kanban-column.component.html`:
   ```html
   <!-- cdkDropList = Drop-Zone. id und data müssen gesetzt sein -->
   <div cdkDropList
        [id]="columnId()"
        [cdkDropListData]="tasks()"
        (cdkDropListDropped)="taskDropped.emit($event)">

     @for (task of tasks(); track task.id) {
       <!-- cdkDrag = draggbares Element -->
       <app-task-card [task]="task" cdkDrag [cdkDragData]="task" />
     }
   </div>
   ```

4. **Event-Handler** – `kanban-board.component.ts`:
   ```typescript
   onTaskDropped(event: CdkDragDrop<Task[]>): void {
     // Nur bei Spaltenwechsel dispatchen
     if (event.previousContainer !== event.container) {
       const task: Task = event.previousContainer.data[event.previousIndex];
       const newStatus = event.container.id as TaskStatus;
       this.store.dispatch(new UpdateTaskStatus(task.id, newStatus));
     }
   }
   ```
   → "Das `CdkDragDrop`-Event enthält die Quelle, das Ziel, den Index und die Daten – alles was ihr braucht."

**CDK-Attribute im Überblick:**

| Attribut | Wo | Funktion |
|---|---|---|
| `cdkDropListGroup` | Parent-Container | Verbindet alle Child-DropLists miteinander |
| `cdkDropList` | Spalte | Definiert eine Drop-Zone |
| `[id]="..."` | Drop-Zone | Eindeutige ID – wird beim Drop als `container.id` geliefert |
| `[cdkDropListData]="..."` | Drop-Zone | Daten-Array der Zone (für den Event-Handler) |
| `(cdkDropListDropped)="..."` | Drop-Zone | Event wenn etwas gedroppt wird |
| `cdkDrag` | Drag-Element | Macht ein Element draggbar |
| `[cdkDragData]="..."` | Drag-Element | Daten die beim Drop mitgeliefert werden |
| `[cdkDropListEnterPredicate]="fn"` | Drop-Zone | Funktion die entscheidet ob ein Drag-Element darf |

**Häufige Fragen:**
- *"Warum CDK und nicht eine eigene Lösung?"*
  → CDK ist: Accessibility-konform (Tastaturnavigation mit Pfeil-Tasten), mobile-kompatibel (Touch-Events), schon in Angular integriert, gut getestet. Eigene DnD-Implementierungen sind error-prone und nicht barrierefrei.
- *"Kann ich die Drag-Animation anpassen?"*
  → Ja! `cdkDragPreviewClass` für den Placeholder, `.cdk-drag-animating` CSS-Klasse für die Rückkehr-Animation.
- *"Wie funktioniert Tastatur-Drag?"*
  → Space = Drag starten, Pfeiltasten = verschieben, Space = droppen, Escape = abbrechen. Alles eingebaut!

**Troubleshooting:**

| Symptom | Ursache | Lösung |
|---|---|---|
| Task kann nur in der eigenen Spalte verschoben werden | `cdkDropListGroup` fehlt | `cdkDropListGroup` auf Parent-Container |
| `(cdkDropListDropped)` feuert nicht | `cdkDropList` fehlt | Direktive auf dem Container-Div |
| Task springt zurück nach Drop | `UpdateTaskStatus` wird nicht dispatcht | `event.previousContainer !== event.container` prüfen |
| `enterPredicate` blockiert alles | Funktion gibt immer `false` zurück | Funktion-Signatur: `(drag: CdkDrag, drop: CdkDropList) => boolean` |

---

### Übung 5 (10 Min)

**Erwartetes Ergebnis:** Teilnehmer haben einen `enterPredicate`-Guard hinzugefügt (z.B. "Done"-Spalte akzeptiert nur In-Progress-Tasks) und eine visuelle Hervorhebung der aktiven Drop-Zone.

**Schritt-für-Schritt für schnelle Hilfe:**

1. `enterPredicate` in `kanban-column.component.ts` als Input:
   ```typescript
   // Optionale Guard-Funktion – Standard: alle erlaubt
   readonly enterPredicate = input<(drag: CdkDrag, drop: CdkDropList) => boolean>(
     () => true
   );
   ```

   Im Template binden:
   ```html
   <div cdkDropList [cdkDropListEnterPredicate]="enterPredicate()">
   ```

2. Guard in `kanban-board.component.html` definieren:
   ```html
   <!-- Für die "done"-Spalte: nur Tasks aus "in-progress" erlauben -->
   <app-kanban-column
     columnId="done"
     [enterPredicate]="onlyFromInProgress"
     ... />
   ```

   In `kanban-board.component.ts`:
   ```typescript
   readonly onlyFromInProgress = (drag: CdkDrag, drop: CdkDropList): boolean => {
     return drag.data?.status === 'in-progress';
   };
   ```

3. Visuelles Highlight – `isDropTarget = signal(false)` in der Spalte:
   ```typescript
   readonly isDropTarget = signal(false);
   ```
   ```html
   <div cdkDropList
        [class.drop-highlight]="isDropTarget()"
        (cdkDropListEntered)="isDropTarget.set(true)"
        (cdkDropListExited)="isDropTarget.set(false)"
        (cdkDropListDropped)="isDropTarget.set(false); taskDropped.emit($event)">
   ```
   In `styles.css`:
   ```css
   .drop-highlight { background: rgba(25, 135, 84, 0.1); border: 2px dashed #198754; }
   ```

**Häufige Probleme:**
- `cdkDropListGroup` fehlt → Drags bleiben in der eigenen Spalte
- `enterPredicate` gibt immer `false` → Alle Drags blockiert; Funktion-Signatur prüfen
- CSS-Klasse `.drop-highlight` hat keine Wirkung → Klasse in `styles.css` (nicht component CSS) eintragen
- `drag.data` ist `undefined` → `[cdkDragData]="task"` im Task-Card-Template setzen

**Recovery bei Zeitnot:** `enterPredicate` ist Pflicht, visuelles Highlight als Hausaufgabe.

---

## Timing-Management

| Situation | Lösung |
|---|---|
| Modul 2 (NGXS) dauert zu lang | Bonus-Aufgaben von Übung 2 streichen |
| Modul 3 (RxJS) läuft zu schnell | Async/Await Bonus-Aufgabe live machen |
| Übung 4 (Forms) – Teilnehmer hängen | Custom Validator gemeinsam live-coden |
| Zeitpuffer fehlt | Übung 5 als Hausaufgabe |

---

## Offline-Modus (falls kein Internet)

Alternativ zu JSONPlaceholder: JSON-Server lokal starten

```bash
# JSON-Server installieren (einmalig)
npm install -g json-server

# Fixture-Datei erstellen
cat > /tmp/db.json << 'EOF'
{
  "todos": [
    {"id": 1, "userId": 1, "title": "Angular Signals verstehen", "completed": false},
    {"id": 2, "userId": 1, "title": "NGXS einrichten", "completed": false},
    {"id": 3, "userId": 2, "title": "HTTP Client konfigurieren", "completed": true}
  ]
}
EOF

# Server starten
json-server --watch /tmp/db.json --port 3000
```

URL in `task-api.service.ts` auf `http://localhost:3000` ändern.

---

## Angular Migrations – Facilitator-Notizen (Bonus-Modul)

> Zeitpunkt: Als Bonus am Ende, oder wenn Zeit vorhanden (ab ca. 03:25). Auch gut als eigenständiger Deep-Dive in einem Folgeworkshop.

### Was ist die Kernbotschaft?

> "Ihr müsst modernen Angular-Code nicht von Hand schreiben. Angular CLI kann euren bestehenden Code automatisch modernisieren – wie OpenRewrite für Java."

### Wichtigste Punkte live zeigen

1. **Dry-Run demonstrieren** – immer zuerst:
   ```bash
   npx ng generate @angular/core:signal-inputs --dry-run
   ```
   → Zeigt welche Dateien geändert würden (grün/rot im Terminal)

2. **Was der Linter schon gemacht hat** – Vergleich zeigen:
   - Alt: `@Input() task!: Task;` + Im Template: `task.title`
   - Neu: `readonly task = input.required<Task>();` + Im Template: `task().title`
   - Kernunterschied: Signal-Inputs sind **Funktionsaufrufe** im Template!

3. **Migrations-Reihenfolge** für Legacy-Projekte:
   ```
   standalone → control-flow → inject-function → signal-inputs → outputs → cleanup
   ```

### Häufige Fragen zu Migrations

| Frage | Antwort |
|---|---|
| "Kann die Migration Code brechen?" | Selten, aber möglich. Immer erst `--dry-run`, dann Git-Commit, dann Migration. |
| "Muss ich alle Migrations auf einmal machen?" | Nein! Schrittweise migrieren. Jede Migration ist unabhängig. |
| "Was ist der Unterschied zu `ng update`?" | `ng update` = Framework-Version hochziehen (z.B. v20 → v21). Migrations = Code-Muster modernisieren innerhalb einer Version. |
| "Werden Tests automatisch auch migriert?" | Ja! Die Migrations berücksichtigen auch `*.spec.ts` Dateien. |
| "input() vs @Input() – was soll ich in neuen Projekten nutzen?" | Immer `input()` in neuen Projekten. `@Input()` ist deprecated ab Angular 21. |

### Zusammenhang mit dem Workshop-Projekt

Im Workshop-Projekt hat der Linter **automatisch** folgende Migrations angewendet:
- `signal-inputs`: `@Input()` → `input()`
- `outputs`: `@Output() EventEmitter` → `output()`

Das ist **kein Bug** – das ist Angular 21 Best Practice!

---

## Q&A Parking Lot (typische Off-Topic Fragen)

| Frage | Kurzantwort |
|---|---|
| "Was ist Zoneless Angular?" | Experimentell seit Angular 18. Kein Zone.js Patching mehr. Signals machen es möglich. |
| "NgRx vs NGXS?" | NgRx = funktional, mehr Community. NGXS = class-based wie wir heute. Beide gut. |
| "Server-Side Rendering?" | Angular Universal → heute: `ng add @angular/ssr`. |
| "Nx Monorepo?" | Für Projekte mit mehreren Apps/Libs (z.B. Spring Boot + Angular Backend + Frontend zusammen). |
| "Standalone vs Modules?" | Standalone ist seit Angular 17 der Standard. NgModules sind deprecated aber noch supported. |
| "httpResource() API?" | Experimentell in Angular 19+. Ersetzt HttpClient für einfache Fälle. Noch nicht produktionsreif. |
| "Migrations vs ng update?" | `ng update` = neue Version. Migrations = Code modernisieren innerhalb der aktuellen Version. |
| "input() vs @Input()?" | In neuen Projekten immer `input()`. `@Input()` ist deprecated in Angular 21+. |
