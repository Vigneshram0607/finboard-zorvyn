import { Component, OnInit, HostListener } from '@angular/core';
import { ThemeService } from './services/theme.service';
import { TransactionService } from './services/transaction.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-shell">
      <!-- Mobile Header -->
      <div class="mobile-header">
        <div class="mobile-logo">
          <div class="mobile-logo-icon">
            <svg-icon name="bar-chart" style="width:15px;height:15px"></svg-icon>
          </div>
          <span class="mobile-logo-name">FinBoard</span>
        </div>
        <div class="mobile-header-actions">
          <button class="icon-btn-sm" (click)="themeService.toggle()" [title]="isDark ? 'Switch to Light' : 'Switch to Dark'">
            <svg-icon [name]="isDark ? 'sun' : 'moon'" style="width:18px;height:18px"></svg-icon>
          </button>
          <button class="menu-btn" (click)="sidebarOpen = !sidebarOpen">
            <svg-icon [name]="sidebarOpen ? 'x' : 'menu'" style="width:20px;height:20px"></svg-icon>
          </button>
        </div>
      </div>

      <!-- Sidebar Overlay -->
      <div class="sidebar-overlay" *ngIf="sidebarOpen" (click)="sidebarOpen = false"></div>

      <!-- Sidebar -->
      <div class="sidebar-wrap" [class.open]="sidebarOpen">
        <app-navbar (mobileClose)="sidebarOpen = false"></app-navbar>
      </div>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Global Toast Host -->
    <!-- <app-toast></app-toast> -->
  `,
  styles: [`
    .app-shell {
      display: flex;
      min-height: 100vh;
      background: var(--bg-base);
    }

    /* ── Sidebar ──────────────────────────────────────────── */
    .sidebar-wrap {
      position: sticky; top: 0;
      height: 100vh; flex-shrink: 0; z-index: 100;

      @media (max-width: 900px) {
        position: fixed; left: -260px; top: 0; height: 100%;
        transition: left 0.3s cubic-bezier(0.4,0,0.2,1);
        &.open { left: 0; }
      }
    }

    /* ── Mobile Header ──────────────────────────────────────── */
    .mobile-header {
      display: none;
      position: fixed; top: 0; left: 0; right: 0; height: 54px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      padding: 0 14px;
      align-items: center; justify-content: space-between;
      z-index: 200;
      transition: background 0.3s ease;

      @media (max-width: 900px) { display: flex; }
    }

    .mobile-logo { display: flex; align-items: center; gap: 8px; }

    .mobile-logo-icon {
      width: 30px; height: 30px; border-radius: 8px;
      background: linear-gradient(135deg, var(--accent-gold), #b86d05);
      display: flex; align-items: center; justify-content: center;
      color: #fff;
    }

    .mobile-logo-name {
      font-family: 'Outfit', sans-serif;
      font-size: 17px; font-weight: 800;
      color: var(--text-primary);
    }

    .mobile-header-actions { display: flex; align-items: center; gap: 4px; }

    .icon-btn-sm {
      width: 34px; height: 34px; border: none;
      background: transparent; color: var(--text-secondary);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      border-radius: 6px; transition: all 0.2s;
      &:hover { background: var(--bg-elevated); color: var(--text-primary); }
    }

    .menu-btn {
      background: transparent; border: none; cursor: pointer;
      color: var(--text-primary);
      display: flex; align-items: center; justify-content: center;
      padding: 6px; border-radius: 6px; transition: background 0.2s;
      &:hover { background: var(--bg-elevated); }
    }

    /* ── Overlay ────────────────────────────────────────────── */
    .sidebar-overlay {
      display: none;
      @media (max-width: 900px) {
        display: block; position: fixed; inset: 0;
        background: rgba(0,0,0,0.55); backdrop-filter: blur(2px);
        z-index: 99;
      }
    }

    /* ── Main ───────────────────────────────────────────────── */
    .main-content {
      flex: 1; min-width: 0; overflow-y: auto; height: 100vh;
      @media (max-width: 900px) { padding-top: 54px; }
    }
  `]
})
export class AppComponent implements OnInit {
  sidebarOpen = false;
  isDark = true;

  constructor(
    public themeService: ThemeService,
    private txService: TransactionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.themeService.theme$.subscribe(t => this.isDark = t === 'dark');
  }

  @HostListener('window:keydown', ['$event'])
  onGlobalKey(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) return;
      e.preventDefault();
      if (this.txService.canUndo) {
        this.txService.undo();
        this.toastService.info('Undone', 'Last action was reversed');
      }
    }
  }
}
