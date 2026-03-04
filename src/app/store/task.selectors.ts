import {Selector} from '@ngxs/store';

import {Task, TaskPriority, TaskStateModel} from '../core/models/task.model';
import {TaskState} from './task.state';

/**
 * NGXS Selektoren – reine Funktionen die State → abgeleitete Werte berechnen.
 *
 * Spring-Analogie: Repository-Query-Methoden (findByStatus, findAll etc.)
 * Selektoren werden gecacht: nur neu berechnet wenn sich der State ändert.
 */
export class TaskSelectors {
  @Selector([TaskState])
  static allTasks(state: TaskStateModel): Task[] {
    return state.tasks;
  }

  @Selector([TaskState])
  static error(state: TaskStateModel): string | null {
    return state.error;
  }

  @Selector([TaskState])
  static selectedPriority(state: TaskStateModel): TaskPriority | 'all' {
    return state.selectedPriority;
  }

  @Selector([TaskState])
  static filter(state: TaskStateModel): string {
    return state.filter;
  }

  /** Abgeleiteter Selektor: kombiniert filter + priority aus dem State */
  @Selector([TaskState])
  static filteredTasks(state: TaskStateModel): Task[] {
    const q = state.filter.toLowerCase();
    return state.tasks.filter(
      t =>
        (state.selectedPriority === 'all' || t.priority === state.selectedPriority) &&
        (!q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)),
    );
  }

  /** Komposition: todoTasks basiert auf filteredTasks */
  @Selector([TaskSelectors.filteredTasks])
  static todoTasks(filteredTasks: Task[]): Task[] {
    return filteredTasks.filter(t => t.status === 'todo');
  }

  @Selector([TaskSelectors.filteredTasks])
  static inProgressTasks(filteredTasks: Task[]): Task[] {
    return filteredTasks.filter(t => t.status === 'in-progress');
  }

  @Selector([TaskSelectors.filteredTasks])
  static doneTasks(filteredTasks: Task[]): Task[] {
    return filteredTasks.filter(t => t.status === 'done');
  }

  /** Statistiken für den Fortschrittsbalken */
  @Selector([TaskState])
  static taskCount(state: TaskStateModel) {
    const total = state.tasks.length;
    const done = state.tasks.filter(t => t.status === 'done').length;
    const inProgress = state.tasks.filter(t => t.status === 'in-progress').length;
    const todo = state.tasks.filter(t => t.status === 'todo').length;
    return {total, done, inProgress, todo};
  }
}
