import { Injectable, signal } from '@angular/core';
import { AppNotification } from '../models/data-source.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications = signal<AppNotification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  show(type: AppNotification['type'], title: string, message: string, durationMs = 4000): void {
    const note: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type, title, message,
      timestamp: Date.now(),
    };
    this._notifications.update(n => [note, ...n].slice(0, 8));
    setTimeout(() => this.dismiss(note.id), durationMs);
  }

  success(title: string, message: string): void { this.show('success', title, message); }
  error(title: string, message: string): void    { this.show('error',   title, message, 6000); }
  warning(title: string, message: string): void  { this.show('warning', title, message); }
  info(title: string, message: string): void     { this.show('info',    title, message); }

  dismiss(id: string): void {
    this._notifications.update(n => n.filter(x => x.id !== id));
  }
}
