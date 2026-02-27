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

**Ziel:** Vertrauen schaffen. Die Teilnehmer sollen verstehen dass Angular viele Konzepte hat die sie aus Spring kennen.

**Einstieg:**
> "Wer von euch hat schon mal einen Spring `@Service` geschrieben? Gut. Dann kennt ihr bereits das Konzept hinter Angular Services."

**Häufige Fragen:**
- *"Brauchen wir noch NgModule?"* → Nein! Seit Angular 17 sind Standalone Components der Standard. Kein NgModule mehr nötig.
- *"Was ist der Unterschied zu React/Vue?"* → Angular ist opinionated (hat eigene Lösungen für alles: DI, Routing, Forms, HTTP). React ist nur View-Bibliothek.

---

### Modul 1b: Signals (15 Min)

**Kernpunkt:** Signals sind nicht kompliziert – sie sind nur "smarte" Werte.

**Live-Demo-Sequenz:**
1. `signal(0)` erstellen, in Template verwenden
2. Button hinzufügen, `update(v => v + 1)` zeigen
3. `computed()` hinzufügen – zeigen dass es automatisch aktualisiert
4. `effect()` hinzufügen – Konsole zeigen

**Häufige Fragen:**
- *"Wann Signals, wann Observables?"* → Signals für UI-State und abgeleitete Werte. Observables für asynchrone Datenströme (HTTP, WebSockets). `toSignal()` verbindet beides.
- *"Ist Zone.js jetzt obsolet?"* → Noch nicht vollständig, aber in Angular 18+ kann man zoneless arbeiten. Signals sind der erste Schritt dazu.

**Troubleshooting:**
- Signal ändert sich nicht im Template → Signal als Funktion aufrufen: `count()` nicht `count`

---

### Modul 1c: Directives (10 Min)

**Kernpunkt:** Directives sind wiederverwendbare Verhaltenskapsel – keine Logik in der Komponente.

**Live-Demo:** `PriorityBorderDirective` zeigen, dann auf einem Task-Card anwenden.

**Häufige Fragen:**
- *"Wann Directive, wann Component?"* → Component = hat Template (HTML). Directive = kein Template, nur Verhaltensänderung am bestehenden Element.
- *"Warum Renderer2 und nicht direkt style setzen?"* → SSR-Kompatibilität und Testbarkeit. Direkter DOM-Zugriff funktioniert nicht in Server-Side Rendering.

---

### Übung 1 (20 Min)

**Erwartetes Ergebnis:** Teilnehmer haben Signal, computed und effect in der Komponente und eine eigene Directive.

**Häufige Probleme:**
- Signal wird ohne `()` im Template aufgerufen → Erinnern: `count()` ist Signal-Lesen
- `effect()` außerhalb des Konstruktors aufrufen → Error! Muss im Konstruktor oder Injection-Context sein
- Renderer2 fehlt im `inject()` → `import { Renderer2 } from '@angular/core'`

**Recovery bei Zeitnot:** Aufgaben 1-3 sind Pflicht, 4 optional.

---

### Modul 2: NGXS (20 Min)

**Kernpunkt:** NGXS = Spring Service + Repository + Event System in einem.

**Einstieg:**
> "Stellt euch vor ihr habt einen Spring `@Service TaskService` der alle Tasks hält. Alle Komponenten müssen diesen Service injizieren und Methoden aufrufen. NGXS macht das formaler und skalierbarer – mit Actions als typsichere Methodenaufrufe."

**Live-Demo-Sequenz:**
1. `provideStore()` in `app.config.ts` zeigen
2. Redux DevTools öffnen
3. Seite laden → `[Task] Load From API` und `[Task] Load Success` im DevTools sehen
4. Task hinzufügen → `[Task] Add` dispatcht

**Häufige Fragen:**
- *"NGXS vs NgRx?"* → NGXS: Decorator-basiert, weniger Boilerplate, gut für Java-Entwickler. NgRx: Funktional, mehr Community, näher an Redux. Für diesen Workshop passt NGXS besser.
- *"Muss ich alles in den Store?"* → Nein! UI-State (Formular offen/zu, Hover-States) gehört in die Komponente als lokales Signal.

**Troubleshooting:**
- `provideStore()` fehlt in `app.config.ts` → App startet, aber Store ist undefined
- `@State` wird nicht gefunden → NGXS nicht importiert, oder Schreibfehler im State-Namen

---

### Übung 2 (15 Min)

**Häufige Probleme:**
- Vergessen `ToggleTaskStatus` zu importieren → TypeScript-Fehler: "is not a constructor"
- Selector gibt falschen Typ zurück → Rückgabetyp prüfen
- Redux DevTools zeigen Action nicht → Extension nicht installiert oder Store nicht konfiguriert

---

### Modul 3: HTTP + Interceptor + RxJS (20 Min)

**Kernpunkt:** RxJS = deklarative Verarbeitungspipeline für asynchrone Daten.

**Marble-Diagram live erklären:**

```
Quelle:    ----1----2----3---->
map(x*2):  ----2----4----6---->
filter>3:  ---------4----6---->
```

**Häufige Fragen:**
- *"Warum Observable und nicht Promise?"* → Observable = mehrere Werte über Zeit (z.B. WebSocket). Promise = genau ein Wert. HTTP-Requests können auch abgebrochen werden (Observable cancelbar, Promise nicht).
- *"Was ist takeUntilDestroyed?"* → Moderner Angular 16+ Cleanup ohne `ngOnDestroy`. Intern nutzt es `DestroyRef`.
- *"Funktionaler Interceptor vs Klassen-Interceptor?"* → Functional ist Angular 15+ Standard. Weniger Boilerplate, kein `@Injectable` nötig.

---

### Übung 3 (15 Min)

**Häufige Probleme:**
- `tap()` importiert aus 'rxjs/operators' statt 'rxjs' → Beide funktionieren, aber moderner: `import { tap } from 'rxjs'`
- `retry()` nach `catchError()` → Falsche Reihenfolge! retry muss VOR catchError stehen
- `firstValueFrom()` kennt den Rückgabetyp nicht → TypeScript-Typen manuell angeben

---

### Modul 3b: Route Resolver (5 Min)

**Schnelle Erklärung:**
> "Resolver = Tor vor der Komponente. Die Komponente öffnet erst wenn der Resolver fertig ist. Keine leeren Seiten mehr beim ersten Laden."

**Zeigen:** In `app.routes.ts` den Resolver-Eintrag erklären.

---

### Modul 4: Reactive Forms (15 Min)

**Kernpunkt:** FormBuilder = typsicheres Formular-Factory. Validators = deklarative Regeln.

**Live-Demo:** `TaskFormComponent` öffnen, FormGroup erklären.

**Häufige Fragen:**
- *"Template-Driven vs Reactive Forms?"* → Template-Driven: einfacher für kleine Formulare. Reactive: besser testbar, typsicher, besser für komplexe Formulare. In Enterprise-Apps: immer Reactive.
- *"Warum `submitted = signal(false)`?"* → Bootstrap `is-invalid` Klasse sofort beim Öffnen anzeigen ist UX-schlecht. Erst nach Submit-Versuch zeigen.

---

### Übung 4 (20 Min)

**Häufige Probleme:**
- `toSignal(valueChanges)` gibt `undefined` zurück → `initialValue` setzen oder `requireSync: false` nutzen
- Custom Validator wird nicht ausgelöst → Prüfen ob er korrekt im `fb.group()` eingetragen ist
- `store.selectSnapshot()` gibt leeres Array zurück → Resolver hat noch nicht geladen

---

### Modul 5: CDK Drag & Drop (10 Min)

**Schnell zeigen:** Drag & Drop in der laufenden App demonstrieren.

**Häufige Fragen:**
- *"Warum CDK und nicht eine eigene Lösung?"* → CDK ist Accessibility-konform (Tastaturnavigation), browser-kompatibel und gut getestet.

---

### Übung 5 (10 Min)

**Häufige Probleme:**
- `cdkDropListGroup` fehlt im Board → alle Drop-Listen sind nicht verbunden
- `enterPredicate` gibt immer `false` zurück → Alle Drags werden blockiert
- CSS-Klasse `.drop-target-active` hat keine Wirkung → Vergessen die styles.css anzupassen

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

## Q&A Parking Lot (typische Off-Topic Fragen)

| Frage | Kurzantwort |
|---|---|
| "Was ist Zoneless Angular?" | Experimentell seit Angular 18. Kein Zone.js Patching mehr. Signals machen es möglich. |
| "NgRx vs NGXS?" | NgRx = funktional, mehr Community. NGXS = class-based wie wir heute. Beide gut. |
| "Server-Side Rendering?" | Angular Universal → heute: `ng add @angular/ssr`. |
| "Nx Monorepo?" | Für Projekte mit mehreren Apps/Libs (z.B. Spring Boot + Angular Backend + Frontend zusammen). |
| "Standalone vs Modules?" | Standalone ist seit Angular 17 der Standard. NgModules sind deprecated aber noch supported. |
| "httpResource() API?" | Experimentell in Angular 19+. Ersetzt HttpClient für einfache Fälle. Noch nicht produktionsreif. |
