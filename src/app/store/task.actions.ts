import type {Task, TaskPriority, TaskStatus} from '../core/models/task.model';

export class LoadTasksFromApi {
  static readonly type = '[Task] Load From API';
}

export class LoadTasksSuccess {
  static readonly type = '[Task] Load Success';

  constructor(public tasks: Task[]) {
  }
}

export class LoadTasksFailure {
  static readonly type = '[Task] Load Failure';

  constructor(public error: string) {
  }
}

export class AddTask {
  static readonly type = '[Task] Add';

  constructor(public payload: Omit<Task, 'id' | 'createdAt'>) {
  }
}

export class UpdateTaskStatus {
  static readonly type = '[Task] Update Status';

  constructor(
    public taskId: string,
    public status: TaskStatus,
  ) {
  }
}

export class DeleteTask {
  static readonly type = '[Task] Delete';

  constructor(public taskId: string) {
  }
}

export class SetFilter {
  static readonly type = '[Task] Set Filter';

  constructor(public filter: string) {
  }
}

export class SetPriorityFilter {
  static readonly type = '[Task] Set Priority Filter';

  constructor(public priority: TaskPriority | 'all') {
  }
}
