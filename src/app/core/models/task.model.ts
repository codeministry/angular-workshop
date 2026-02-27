export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  assignee?: string;
}

/** Shape der JSONPlaceholder /todos API */
export interface TodoApiItem {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface TaskStateModel {
  tasks: Task[];
  filter: string;
  selectedPriority: TaskPriority | 'all';
  error: string | null;
}
