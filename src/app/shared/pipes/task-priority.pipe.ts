import { Pipe, PipeTransform } from '@angular/core';

import { TaskPriority } from '../../core/models/task.model';

export interface PriorityBadge {
  label: string;
  cssClass: string;
}

/**
 * Transformiert eine TaskPriority in ein Badge-Objekt mit Label und CSS-Klasse.
 *
 * Verwendung im Template:
 *   @let badge = task.priority | taskPriority;
 *   <span [class]="badge.cssClass">{{ badge.label }}</span>
 */
@Pipe({
  name: 'taskPriority',
  standalone: true,
  pure: true, // Nur neu berechnen wenn sich der Eingabewert ändert
})
export class TaskPriorityPipe implements PipeTransform {
  private readonly badgeMap: Record<TaskPriority, PriorityBadge> = {
    high: { label: 'Hoch', cssClass: 'badge bg-danger' },
    medium: { label: 'Mittel', cssClass: 'badge bg-warning text-dark' },
    low: { label: 'Niedrig', cssClass: 'badge bg-success' },
  };

  transform(priority: TaskPriority): PriorityBadge {
    return this.badgeMap[priority];
  }
}
