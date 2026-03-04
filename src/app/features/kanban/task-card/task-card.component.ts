import {ChangeDetectionStrategy, Component, inject, input} from '@angular/core';
import {Store} from '@ngxs/store';

import {Task} from '../../../core/models/task.model';
import {DeleteTask} from '../../../store/task.actions';
import {PriorityBorderDirective} from '../../../shared/directives/priority-border.directive';
import {TaskPriorityPipe} from '../../../shared/pipes/task-priority.pipe';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [PriorityBorderDirective, TaskPriorityPipe],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  readonly task = input.required<Task>();

  private readonly store = inject(Store);

  onDelete(): void {
    this.store.dispatch(new DeleteTask(this.task().id));
  }
}
