import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AppRole } from '../../../models/transaction.model';
import { RoleService } from '../../../services/role.service';

import { Theme, ThemeService } from '../../../services/theme.service';
import { ToastService } from '../../../services/toast.service';
import { TransactionService } from '../../../services/transaction.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Output() mobileClose = new EventEmitter<void>();

  navItems = [
    { path: '/dashboard',    label: 'Dashboard',    icon: 'grid'       },
    { path: '/transactions', label: 'Transactions', icon: 'list'       },
    { path: '/insights',     label: 'Insights',     icon: 'bar-chart'  },
    { path: '/budget',       label: 'Budgets',      icon: 'piggy-bank' },
  ];

  currentPath = '/dashboard';
  role: AppRole = 'viewer';
  isDark = true;

  constructor(
    private router: Router,
    private roleService: RoleService,
    public themeService: ThemeService,
    public txService: TransactionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentPath = this.router.url;
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.currentPath = (e as NavigationEnd).url);
    this.roleService.role$.subscribe((r:any) => this.role = r);
    this.themeService.theme$.subscribe((t:any) => this.isDark = t === 'dark');
  }

  setRole(role: AppRole): void { this.roleService.setRole(role); }
  setTheme(t: Theme): void    { this.themeService.setTheme(t); }

  undoLastAction(): void {
    if (this.txService.canUndo) {
      this.txService.undo();
      this.toastService.info('Undone', 'Last action was reversed');
    }
  }

  get canUndo(): boolean { return this.txService.canUndo; }

  navigate(path: string): void {
    this.router.navigate([path]);
    this.mobileClose.emit();
  }
}
