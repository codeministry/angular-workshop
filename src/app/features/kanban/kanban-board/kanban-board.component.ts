import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {CdkDragDrop, CdkDropListGroup} from '@angular/cdk/drag-drop';
import {Store} from '@ngxs/store';

import {Task, TaskStatus} from '../../../core/models/task.model';
import {TaskSelectors} from '../../../store/task.selectors';
import {UpdateTaskStatus} from '../../../store/task.actions';
import {LoadingService} from '../../../core/services/loading.service';
import {KanbanColumnComponent} from '../kanban-column/kanban-column.component';
import {TaskFormComponent} from '../task-form/task-form.component';
import {TaskFilterComponent} from '../task-filter/task-filter.component';
import {LoadingSpinnerComponent} from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CdkDropListGroup,
    KanbanColumnComponent,
    TaskFormComponent,
    TaskFilterComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoardComponent {
  private readonly store = inject(Store);
  protected loadingService = inject(LoadingService);

  // toSignal() = Brücke zwischen NGXS Observable und Angular Signal
  // Alle NGXS-Selektoren als Signals: kein async-Pipe nötig!
  readonly todoTasks = toSignal(this.store.select(TaskSelectors.todoTasks), {initialValue: []});
  readonly inProgressTasks = toSignal(this.store.select(TaskSelectors.inProgressTasks), {
    initialValue: [],
  });
  readonly doneTasks = toSignal(this.store.select(TaskSelectors.doneTasks), {initialValue: []});
  readonly taskCount = toSignal(this.store.select(TaskSelectors.taskCount), {
    initialValue: {total: 0, done: 0, inProgress: 0, todo: 0},
  });
  readonly errorMessage = toSignal(this.store.select(TaskSelectors.error), {initialValue: null});

  // Lokales UI-Signal für Formular-Sichtbarkeit
  // Kein Store nötig – UI-State gehört in die Komponente
  readonly showForm = signal(false);

  onTaskDropped(event: CdkDragDrop<Task[]>): void {
    // Nur bei Spaltenwechsel dispatchen
    if (event.previousContainer !== event.container) {
      const task: Task = event.previousContainer.data[event.previousIndex];
      const newStatus = event.container.id as TaskStatus;
      this.store.dispatch(new UpdateTaskStatus(task.id, newStatus));
    }
  }

  /**
   * Dieser Code nutzt Angular Signals, um einen berechneten Zustand reaktiv zu verwalten. Hier ist die spezifische Erklärung der Signal-Mechanik:
   * 1. computed(...) (Berechnetes Signal)
   *
   * computed erstellt ein schreibgeschütztes Signal, dessen Wert von anderen Signals abhängt.
   *
   * Memoization: Der Wert wird nur dann neu berechnet, wenn sich das zugrunde liegende Signal (taskCount) ändert. Ansonsten wird der zuletzt berechnete Wert effizient wiederverwendet.
   * 2. this.taskCount() (Signal-Abhängigkeit)
   *
   * Durch den Aufruf von taskCount als Funktion (()) innerhalb der computed-Funktion wird dieses Signal als Abhängigkeit registriert.
   *
   * Angular trackt diesen Aufruf automatisch. Wenn taskCount einen neuen Wert erhält (z. B. durch ein Store-Update), wird completionPercent als "dirty" markiert und bei Bedarf neu berechnet.
   * 3. Reaktivität ohne Lifecycle-Hooks
   *
   * Im Gegensatz zu klassischen Variablen muss man hier kein ngOnChanges oder manuelle Subscriptions nutzen.
   *
   * Sobald sich die Daten im Store ändern, "fließt" die Änderung automatisch durch das taskCount-Signal in das completionPercent-Signal und aktualisiert direkt die Stellen im HTML-Template, die dieses Signal nutzen.
   * 4. readonly
   *
   * Das Schlüsselwort readonly stellt sicher, dass completionPercent nicht durch eine direkte Zuweisung (z. B. this.completionPercent = 50) verändert werden kann. Da es ein computed Signal ist, wird sein Wert ausschließlich durch die interne Logik bestimmt.
   */
  readonly completionPercent = computed(() => {
    const count = this.taskCount();
    return count.total > 0 ? Math.round((count.done / count.total) * 100) : 0;
  });
}
