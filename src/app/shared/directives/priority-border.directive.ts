import { Directive, ElementRef, Input, OnChanges, Renderer2, inject } from '@angular/core';

import { TaskPriority } from '../../core/models/task.model';

/**
 * Attribute Directive – setzt automatisch einen farbigen linken Rahmen
 * basierend auf der Task-Priorität.
 *
 * Spring-Analogie: Custom Annotation + AOP-Aspect (deklarativ, wiederverwendbar)
 *
 * Verwendung: <div [appPriorityBorder]="task.priority">
 */
@Directive({
  selector: '[appPriorityBorder]',
  standalone: true,
})
export class PriorityBorderDirective implements OnChanges {
  @Input('appPriorityBorder') priority: TaskPriority = 'low';

  // inject() in einer Direktive – kein Konstruktor nötig
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  private readonly colorMap: Record<TaskPriority, string> = {
    high: '#dc3545',
    medium: '#fd7e14',
    low: '#198754',
  };

  ngOnChanges(): void {
    // Renderer2 statt direkter DOM-Manipulation → SSR-kompatibel
    this.renderer.setStyle(
      this.el.nativeElement,
      'border-left',
      `4px solid ${this.colorMap[this.priority]}`,
    );
  }
}
