import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ToastService, Toast } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-container" aria-live="polite">
      <div
        *ngFor="let t of toasts; trackBy: trackById"
        class="toast"
        [class]="t.type"
        (click)="dismiss(t.id)"
      >
        <div class="toast-icon">
          <svg-icon [name]="iconFor(t.type)" style="width:16px;height:16px"></svg-icon>
        </div>
        <div class="toast-body">
          <p class="toast-title">{{ t.title }}</p>
          <p class="toast-msg" *ngIf="t.message">{{ t.message }}</p>
        </div>
        <button
          *ngIf="t.action"
          class="toast-action"
          (click)="$event.stopPropagation(); runAction(t)"
        >{{ t.action.label }}</button>
        <button class="toast-close" (click)="$event.stopPropagation(); dismiss(t.id)">
          <svg-icon name="x" style="width:12px;height:12px"></svg-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      max-width: 360px;
      width: 100%;

      @media (max-width: 480px) { right: 12px; left: 12px; width: auto; }
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 14px 14px 16px;
      border-radius: 12px;
      border: 1px solid var(--border-light);
      background: var(--bg-elevated);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      cursor: pointer;
      pointer-events: all;
      animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
      transition: all 0.2s ease;

      &:hover { transform: translateY(-2px); }

      &.success .toast-icon { color: var(--income-color); background: rgba(52,211,153,0.12); }
      &.error   .toast-icon { color: var(--expense-color); background: rgba(248,113,113,0.12); }
      &.warning .toast-icon { color: var(--accent-gold); background: rgba(245,166,35,0.12); }
      &.info    .toast-icon { color: var(--accent-teal); background: rgba(34,211,238,0.12); }

      &.success { border-left: 3px solid var(--income-color); }
      &.error   { border-left: 3px solid var(--expense-color); }
      &.warning { border-left: 3px solid var(--accent-gold); }
      &.info    { border-left: 3px solid var(--accent-teal); }
    }

    .toast-icon {
      width: 32px; height: 32px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .toast-body { flex: 1; min-width: 0; }

    .toast-title {
      font-size: 13px; font-weight: 600;
      color: var(--text-primary);
    }

    .toast-msg {
      font-size: 12px; color: var(--text-secondary);
      margin-top: 2px; line-height: 1.4;
    }

    .toast-action {
      flex-shrink: 0;
      background: none; border: 1px solid var(--border-light);
      color: var(--accent-gold);
      font-size: 12px; font-weight: 600;
      padding: 4px 10px; border-radius: 6px;
      cursor: pointer; white-space: nowrap;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transition: all 0.2s;

      &:hover { background: rgba(245,166,35,0.1); border-color: var(--accent-gold); }
    }

    .toast-close {
      width: 22px; height: 22px;
      border-radius: 4px; border: none;
      background: transparent;
      color: var(--text-muted); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; flex-shrink: 0;

      &:hover { background: var(--bg-hover); color: var(--text-primary); }
    }

    @keyframes toastIn {
      from { opacity: 0; transform: translateX(20px) scale(0.95); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(t => this.toasts = t);
  }

  dismiss(id: string): void { this.toastService.dismiss(id); }

  runAction(t: Toast): void {
    t.action?.fn();
    this.dismiss(t.id);
  }

  iconFor(type: string): string {
    return { success: 'check', error: 'x', warning: 'alert', info: 'activity' }[type] ?? 'activity';
  }

  trackById(_: number, t: Toast) { return t.id; }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
