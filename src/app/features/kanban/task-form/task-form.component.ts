import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';

import { TaskPriority, TaskStatus } from '../../../core/models/task.model';
import { AddTask } from '../../../store/task.actions';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent {
  @Output() formClosed = new EventEmitter<void>();

  // inject() statt Konstruktor: moderner Angular-DI-Stil
  // Spring-Analogie: @Autowired auf Feldebene
  private fb = inject(FormBuilder);
  private store = inject(Store);

  // Signal für Formular-Submit-Status
  // Aktiviert Fehleranzeige erst nach erstem Submit-Versuch
  submitted = signal(false);

  // FormBuilder erzeugt typsicheres FormGroup
  // Spring-Analogie: @Valid annotiertes DTO mit BindingResult
  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    priority: ['medium' as TaskPriority, Validators.required],
    assignee: [''],
  });

  onSubmit(): void {
    this.submitted.set(true);

    if (this.taskForm.valid) {
      const value = this.taskForm.value;
      this.store.dispatch(
        new AddTask({
          title: value.title!,
          description: value.description ?? '',
          priority: value.priority as TaskPriority,
          status: 'todo' as TaskStatus,
          assignee: value.assignee ?? undefined,
        }),
      );

      // Formular zurücksetzen
      this.taskForm.reset({ priority: 'medium' });
      this.submitted.set(false);
      this.formClosed.emit();
    }
  }
}
