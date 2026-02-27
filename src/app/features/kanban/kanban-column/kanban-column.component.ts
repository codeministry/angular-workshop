import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';

import { Task, TaskStatus } from '../../../core/models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [TaskCardComponent, CdkDropList, CdkDrag],
  templateUrl: './kanban-column.component.html',
  styleUrl: './kanban-column.component.css',
})
export class KanbanColumnComponent {
  @Input({ required: true }) columnId!: TaskStatus;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) tasks: Task[] = [];
  @Input() badgeClass = 'bg-secondary';

  // Drag-Drop-Event wird nach oben gereicht (an KanbanBoardComponent)
  @Output() taskDropped = new EventEmitter<CdkDragDrop<Task[]>>();
}
