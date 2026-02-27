import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { TaskPriority } from '../../../core/models/task.model';
import { TaskSelectors } from '../../../store/task.selectors';
import { SetFilter, SetPriorityFilter } from '../../../store/task.actions';

@Component({
  selector: 'app-task-filter',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './task-filter.component.html',
})
export class TaskFilterComponent {
  private store = inject(Store);

  // Reaktives Suchfeld
  readonly searchControl = new FormControl('');

  // Prioritätsfilter-Optionen
  readonly priorities: Array<TaskPriority | 'all'> = ['all', 'low', 'medium', 'high'];

  // Aktuell ausgewählte Priorität aus dem NGXS-Store als Signal
  // toSignal() verbindet Observable (NGXS) mit Signal (Angular)
  readonly currentPriority = toSignal(this.store.select(TaskSelectors.selectedPriority), {
    initialValue: 'all' as TaskPriority | 'all',
  });

  constructor() {
    // RxJS-Pipeline: debounce → distinctUntilChanged → Store dispatch
    // Spring-Analogie: @Debounce-Annotation in einem Web-Controller
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Wartet 300ms nach letzter Eingabe
        distinctUntilChanged(), // Nur dispatchen wenn sich Wert wirklich ändert
        takeUntilDestroyed(), // Modern: automatisches Cleanup ohne OnDestroy
      )
      .subscribe(value => {
        this.store.dispatch(new SetFilter(value ?? ''));
      });
  }

  onPriorityChange(priority: TaskPriority | 'all'): void {
    this.store.dispatch(new SetPriorityFilter(priority));
  }

  readonly priorityLabels: Record<TaskPriority | 'all', string> = {
    all: 'Alle',
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
  };
}
