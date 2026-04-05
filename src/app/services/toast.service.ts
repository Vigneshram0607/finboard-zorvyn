import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; fn: () => void };
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts$ = new BehaviorSubject<Toast[]>([]);
  toasts$ = this._toasts$.asObservable();

  show(toast: Omit<Toast, 'id'>): string {
    const id = Date.now().toString();
    const t: Toast = { duration: 4000, ...toast, id };
    this._toasts$.next([...this._toasts$.getValue(), t]);

    if (t.duration && t.duration > 0) {
      setTimeout(() => this.dismiss(id), t.duration);
    }
    return id;
  }

  success(title: string, message?: string, action?: Toast['action']) {
    return this.show({ type: 'success', title, message, action });
  }

  error(title: string, message?: string) {
    return this.show({ type: 'error', title, message, duration: 6000 });
  }

  warning(title: string, message?: string) {
    return this.show({ type: 'warning', title, message });
  }

  info(title: string, message?: string) {
    return this.show({ type: 'info', title, message });
  }

  dismiss(id: string): void {
    this._toasts$.next(this._toasts$.getValue().filter(t => t.id !== id));
  }
}
