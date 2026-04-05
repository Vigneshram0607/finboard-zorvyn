import {
  Component, OnInit, OnDestroy, ViewChild,
  ElementRef, AfterViewInit
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { MonthlyData, Transaction, CategoryBreakdown, CATEGORY_LABELS, CATEGORY_COLORS } from '../../models/transaction.model';
import { RoleService } from '../../services/role.service';

import { FinancialSummary, TransactionService } from '../../services/transaction.service';


Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutChartRef!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private trendChart?: Chart;
  private donutChart?: Chart;
  private chartsReady = false;

  summary?: FinancialSummary;
  monthlyData: MonthlyData[] = [];
  allTransactions: Transaction[] = [];
  recentTransactions: Transaction[] = [];
  isAdmin = false;
  isLoading = true;
  today = new Date();

  // Selected month for breakdown (default = current month)
  selectedBreakdownMonth = this.currentMonthKey();
  availableMonths: { key: string; label: string }[] = [];
  donutBreakdown: CategoryBreakdown[] = [];

  CATEGORY_LABELS = CATEGORY_LABELS;

  constructor(
    private txService: TransactionService,
    private roleService: RoleService,
  ) {}

  ngOnInit(): void {
    this.roleService.role$.pipe(takeUntil(this.destroy$))
      .subscribe(r => this.isAdmin = r === 'admin');

    this.txService.summary$.pipe(takeUntil(this.destroy$))
      .subscribe(s => {
        this.summary = s;
        setTimeout(() => this.isLoading = false, 400);
      });

    this.txService.monthlyData$.pipe(takeUntil(this.destroy$))
      .subscribe(d => {
        this.monthlyData = d;
        if (this.chartsReady) this.buildTrendChart();
      });

    this.txService.transactions$.pipe(takeUntil(this.destroy$))
      .subscribe(txns => {
        this.allTransactions = txns;
        this.recentTransactions = [...txns]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 6);
        this.buildAvailableMonths(txns);
        this.recomputeDonut(txns);
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.chartsReady = true;
      this.buildTrendChart();
      this.buildDonutChart();
    }, 150);
  }

  private currentMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private buildAvailableMonths(txns: Transaction[]): void {
    const ML = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const seen = new Map<string, string>();
    txns.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!seen.has(key)) {
        seen.set(key, `${ML[d.getMonth()]} ${d.getFullYear()}`);
      }
    });
    this.availableMonths = Array.from(seen.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, label]) => ({ key, label }));

    // Default to most recent month that has data
    if (this.availableMonths.length && !this.availableMonths.find(m => m.key === this.selectedBreakdownMonth)) {
      this.selectedBreakdownMonth = this.availableMonths[0].key;
    }
  }

  private recomputeDonut(txns: Transaction[]): void {
    const [year, month] = this.selectedBreakdownMonth.split('-').map(Number);
    const expenses = txns.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' &&
        d.getFullYear() === year &&
        (d.getMonth() + 1) === month;
    });

    const totals = new Map<string, number>();
    expenses.forEach(t => totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount));
    const total = [...totals.values()].reduce((s, v) => s + v, 0);

    this.donutBreakdown = Array.from(totals.entries())
      .map(([cat, amount]) => ({
        category: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        color: CATEGORY_COLORS[cat] ?? '#94a3b8',
      }))
      .sort((a, b) => b.amount - a.amount);

    if (this.chartsReady) this.buildDonutChart();
  }

  onBreakdownMonthChange(key: string): void {
    this.selectedBreakdownMonth = key;
    this.recomputeDonut(this.allTransactions);
  }

  get selectedBreakdownLabel(): string {
    return this.availableMonths.find(m => m.key === this.selectedBreakdownMonth)?.label ?? '';
  }

  private buildTrendChart(): void {
    this.trendChart?.destroy();
    if (!this.trendChartRef) return;

    const data = this.monthlyData.slice(-6);
    const ctx  = this.trendChartRef.nativeElement.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, 'rgba(245,166,35,0.25)');
    gradient.addColorStop(1, 'rgba(245,166,35,0)');

    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.month),
        datasets: [
          { label: 'Income',   data: data.map(d => d.income),   borderColor: '#34d399', backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, pointBackgroundColor: '#34d399', pointBorderColor: 'var(--bg-surface)', pointRadius: 4, pointHoverRadius: 7 },
          { label: 'Expenses', data: data.map(d => d.expenses), borderColor: '#f87171', backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, pointBackgroundColor: '#f87171', pointBorderColor: 'var(--bg-surface)', pointRadius: 4, pointHoverRadius: 7 },
          { label: 'Net',      data: data.map(d => d.balance),  borderColor: '#f5a623', backgroundColor: gradient, borderWidth: 2.5, fill: true, tension: 0.4, pointBackgroundColor: '#f5a623', pointBorderColor: 'var(--bg-surface)', pointRadius: 4, pointHoverRadius: 8 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', align: 'end', labels: { color: '#7a8faa', usePointStyle: true, pointStyle: 'circle', boxWidth: 8, font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 } } },
          tooltip: { backgroundColor: '#1a2235', borderColor: '#263550', borderWidth: 1, titleColor: '#eef2f8', bodyColor: '#7a8faa', padding: 12, callbacks: { label: ctx => ` ₹${(ctx.raw as number)?.toLocaleString('en-IN')}` } }
        },
        scales: {
          x: { grid: { color: 'rgba(31,45,69,0.4)' }, ticks: { color: '#4a5f7a', font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } } },
          y: { grid: { color: 'rgba(31,45,69,0.4)' }, ticks: { color: '#4a5f7a', font: { family: "'DM Mono', monospace", size: 11 }, callback: v => `₹${Number(v).toLocaleString('en-IN')}` } }
        }
      }
    });
  }

  private buildDonutChart(): void {
    this.donutChart?.destroy();
    if (!this.donutChartRef || this.donutBreakdown.length === 0) return;

    const ctx  = this.donutChartRef.nativeElement.getContext('2d')!;
    const top5 = this.donutBreakdown.slice(0, 5);

    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: top5.map(c => c.category),
        datasets: [{ data: top5.map(c => c.amount), backgroundColor: top5.map(c => c.color), borderColor: 'var(--bg-surface)', borderWidth: 3, hoverOffset: 8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#7a8faa', usePointStyle: true, pointStyle: 'circle', boxWidth: 8, padding: 14, font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } } },
          tooltip: { backgroundColor: '#1a2235', borderColor: '#263550', borderWidth: 1, titleColor: '#eef2f8', bodyColor: '#7a8faa', padding: 12, callbacks: { label: ctx => ` ₹${(ctx.raw as number)?.toLocaleString('en-IN')} (${top5[ctx.dataIndex].percentage}%)` } }
        }
      }
    });
  }

  trackById(_: number, t: Transaction) { return t.id; }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.trendChart?.destroy();
    this.donutChart?.destroy();
  }
}
