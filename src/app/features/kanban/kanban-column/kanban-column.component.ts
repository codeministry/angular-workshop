import {Component, input, output} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';

import {Task, TaskStatus} from '../../../core/models/task.model';
import {TaskCardComponent} from '../task-card/task-card.component';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [TaskCardComponent, CdkDropList, CdkDrag],
  templateUrl: './kanban-column.component.html',
  styleUrl: './kanban-column.component.css',
})
export class KanbanColumnComponent {
  readonly columnId = input.required<TaskStatus>();
  readonly title = input.required<string>();
  readonly tasks = input.required<Task[]>();
  readonly badgeClass = input('bg-secondary');

  // Drag-Drop-Event wird nach oben gereicht (an KanbanBoardComponent)
  readonly taskDropped = output<CdkDragDrop<Task[]>>();
}
