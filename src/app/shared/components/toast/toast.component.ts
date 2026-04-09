import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { AppNotification } from '../../../models/data-source.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (note of notif.notifications(); track note.id) {
        <div class="toast" [class]="'toast-' + note.type" (click)="notif.dismiss(note.id)">
          <div class="toast-icon">
            @switch (note.type) {
              @case ('success') { <span>✓</span> }
              @case ('error')   { <span>✕</span> }
              @case ('warning') { <span>!</span> }
              @default          { <span>i</span> }
            }
          </div>
          <div class="toast-body">
            <div class="toast-title">{{ note.title }}</div>
            <div class="toast-msg">{{ note.message }}</div>
          </div>
          <button class="toast-close">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed; bottom: 1.5rem; right: 1.5rem;
      display: flex; flex-direction: column; gap: 0.625rem;
      z-index: 9999; pointer-events: none;
    }
    .toast {
      display: flex; align-items: flex-start; gap: 0.75rem;
      background: var(--surface-2); border: 1px solid var(--border-color);
      border-radius: var(--r-lg);
      padding: 0.875rem 1rem;
      min-width: 300px; max-width: 380px;
      box-shadow: var(--shadow-lg);
      cursor: pointer; pointer-events: all;
      animation: slideInRight var(--t-normal) forwards;
      transition: all var(--t-fast);
    }
    .toast:hover { transform: translateX(-4px); }
    .toast-success { border-left: 3px solid var(--accent-green); }
    .toast-error   { border-left: 3px solid var(--accent-red); }
    .toast-warning { border-left: 3px solid var(--accent-yellow); }
    .toast-info    { border-left: 3px solid var(--accent-blue); }
    .toast-icon {
      width: 28px; height: 28px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
    }
    .toast-success .toast-icon { background: var(--accent-green-dim); color: var(--accent-green); }
    .toast-error   .toast-icon { background: var(--accent-red-dim);   color: var(--accent-red); }
    .toast-warning .toast-icon { background: var(--accent-yellow-dim); color: var(--accent-yellow); }
    .toast-info    .toast-icon { background: var(--accent-blue-dim);  color: var(--accent-blue); }
    .toast-body { flex: 1; min-width: 0; }
    .toast-title { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.1rem; }
    .toast-msg   { font-size: 0.78rem; color: var(--text-secondary); }
    .toast-close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.8rem; padding: 0; line-height: 1; }
    .toast-close:hover { color: var(--text-primary); }
  `],
})
export class ToastComponent {
  protected notif = inject(NotificationService);
}
