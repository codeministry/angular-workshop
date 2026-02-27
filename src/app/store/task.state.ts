import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
import { catchError, map } from 'rxjs';

import { TaskApiService } from '../core/services/task-api.service';
import { Task, TaskStateModel, TaskStatus, TodoApiItem } from '../core/models/task.model';
import {
  AddTask,
  DeleteTask,
  LoadTasksFailure,
  LoadTasksFromApi,
  LoadTasksSuccess,
  SetFilter,
  SetPriorityFilter,
  UpdateTaskStatus,
} from './task.actions';

@State<TaskStateModel>({
  name: 'tasks',
  defaults: {
    tasks: [],
    filter: '',
    selectedPriority: 'all',
    error: null,
  },
})
@Injectable()
export class TaskState {
  // Konstruktor-Injection ist in NGXS State-Klassen Standard
  // Spring-Analogie: @Autowired im Konstruktor
  constructor(private taskApiService: TaskApiService) {}

  // Spring-Analogie: @EventListener – reagiert auf ein Event (Action)
  @Action(LoadTasksFromApi)
  loadTasksFromApi(ctx: StateContext<TaskStateModel>) {
    ctx.patchState({ error: null });

    return this.taskApiService.fetchTodos().pipe(
      // Nur die ersten 15 Todos laden und transformieren
      map(todos =>
        ctx.dispatch(new LoadTasksSuccess(todos.slice(0, 15).map(todo => this.mapTodoToTask(todo)))),
      ),
      catchError(err => ctx.dispatch(new LoadTasksFailure(err.message))),
    );
  }

  @Action(LoadTasksSuccess)
  loadTasksSuccess(ctx: StateContext<TaskStateModel>, action: LoadTasksSuccess) {
    ctx.patchState({ tasks: action.tasks });
  }

  @Action(LoadTasksFailure)
  loadTasksFailure(ctx: StateContext<TaskStateModel>, action: LoadTasksFailure) {
    ctx.patchState({ error: action.error });
  }

  @Action(AddTask)
  addTask(ctx: StateContext<TaskStateModel>, action: AddTask) {
    const newTask: Task = {
      ...action.payload,
      id: crypto.randomUUID(),
      status: 'todo',
      createdAt: new Date().toISOString(),
    };
    ctx.patchState({ tasks: [...ctx.getState().tasks, newTask] });
  }

  @Action(UpdateTaskStatus)
  updateTaskStatus(ctx: StateContext<TaskStateModel>, action: UpdateTaskStatus) {
    const tasks = ctx.getState().tasks.map(t =>
      t.id === action.taskId ? { ...t, status: action.status } : t,
    );
    ctx.patchState({ tasks });
  }

  @Action(DeleteTask)
  deleteTask(ctx: StateContext<TaskStateModel>, action: DeleteTask) {
    ctx.patchState({
      tasks: ctx.getState().tasks.filter(t => t.id !== action.taskId),
    });
  }

  @Action(SetFilter)
  setFilter(ctx: StateContext<TaskStateModel>, action: SetFilter) {
    ctx.patchState({ filter: action.filter });
  }

  @Action(SetPriorityFilter)
  setPriorityFilter(ctx: StateContext<TaskStateModel>, action: SetPriorityFilter) {
    ctx.patchState({ selectedPriority: action.priority });
  }

  // Private Hilfsmethode: JSONPlaceholder-Daten → Task-Modell
  private mapTodoToTask(todo: TodoApiItem): Task {
    const statuses: TaskStatus[] = ['todo', 'in-progress', 'done'];
    const priorities = ['low', 'medium', 'high'] as const;
    return {
      id: todo.id.toString(),
      title: todo.title,
      description: `Importiert von JSONPlaceholder (Nutzer #${todo.userId})`,
      status: todo.completed ? 'done' : statuses[todo.id % 2],
      priority: priorities[todo.id % 3],
      createdAt: new Date().toISOString(),
    };
  }
}
