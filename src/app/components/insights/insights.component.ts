import {
  Component, OnInit, OnDestroy, ViewChild,
  ElementRef, AfterViewInit
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { TransactionService } from '../../services/transaction.service';
import {
  Transaction, MonthlyData, CategoryBreakdown,
  CATEGORY_LABELS
} from '../../models/transaction.model';

Chart.register(...registerables);

export interface Insight {
  type: 'positive' | 'warning' | 'neutral';
  icon: string;
  title: string;
  value: string;
  description: string;
}

@Component({
  selector: 'app-insights',
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss']
})
export class InsightsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barChart')  barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('areaChart') areaChartRef!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private barChart?: Chart;
  private areaChart?: Chart;
  private chartsReady = false;

  transactions: Transaction[]       = [];
  monthlyData: MonthlyData[]        = [];
  categoryBreakdown: CategoryBreakdown[] = [];
  insights: Insight[]               = [];
  CATEGORY_LABELS = CATEGORY_LABELS;

  constructor(private txService: TransactionService) {}

  ngOnInit(): void {
    this.txService.transactions$.pipe(takeUntil(this.destroy$))
      .subscribe(txns => {
        this.transactions = txns;
        this.computeInsights(txns);
      });

    this.txService.monthlyData$.pipe(takeUntil(this.destroy$))
      .subscribe(d => {
        this.monthlyData = d;
        if (this.chartsReady) {
          this.buildBarChart();
          this.buildAreaChart();
        }
      });

    // Use all-time breakdown for insights page
    this.txService.allTimeCategoryBreakdown$.pipe(takeUntil(this.destroy$))
      .subscribe(d => this.categoryBreakdown = d);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.chartsReady = true;
      this.buildBarChart();
      this.buildAreaChart();
    }, 150);
  }

  private computeInsights(txns: Transaction[]): void {
    const now = new Date();

    const inMonth = (d: Date, monthsAgo: number) => {
      const ref = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
      return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
    };

    const thisMonthTxns = txns.filter(t => inMonth(new Date(t.date), 0));
    const lastMonthTxns = txns.filter(t => inMonth(new Date(t.date), 1));

    const thisIncome   = thisMonthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const thisExpenses = thisMonthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const lastIncome   = lastMonthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const lastExpenses = lastMonthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings      = thisIncome - thisExpenses;
    const savingsRate  = thisIncome > 0 ? Math.round((savings / thisIncome) * 100) : 0;

    // Top spending category — all time
    const catMap = new Map<string, number>();
    txns.filter(t => t.type === 'expense').forEach(t => {
      catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount);
    });
    const topCatAll = [...catMap.entries()].sort((a, b) => b[1] - a[1])[0];

    // Top spending category — this month
    const catMapMonth = new Map<string, number>();
    thisMonthTxns.filter(t => t.type === 'expense').forEach(t => {
      catMapMonth.set(t.category, (catMapMonth.get(t.category) ?? 0) + t.amount);
    });
    const topCatMonth = [...catMapMonth.entries()].sort((a, b) => b[1] - a[1])[0];

    const expChange = lastExpenses > 0 ? Math.round(((thisExpenses - lastExpenses) / lastExpenses) * 100) : 0;
    const incChange = lastIncome   > 0 ? Math.round(((thisIncome   - lastIncome)   / lastIncome)   * 100) : 0;

    const biggestExp = thisMonthTxns.filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)[0];

    // All-time average monthly expense
    const allMonthlyExpenses = [...new Set(txns.map(t => {
      const d = new Date(t.date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    }))].length;
    const totalAllExpenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const avgMonthlyExpense = allMonthlyExpenses > 0 ? Math.round(totalAllExpenses / allMonthlyExpenses) : 0;

    this.insights = [
      {
        type: savingsRate >= 20 ? 'positive' : 'warning',
        icon: 'piggy-bank',
        title: 'This Month Savings',
        value: `${savingsRate}%`,
        description: savingsRate >= 20
          ? `Saving ₹${Math.max(0, savings).toLocaleString('en-IN')} this month — great work!`
          : `Saved ₹${Math.max(0, savings).toLocaleString('en-IN')} — aim for 20%+.`,
      },
      ...(topCatMonth ? [{
        type: 'neutral' as const,
        icon: 'bar-chart',
        title: 'Top Spend This Month',
        value: CATEGORY_LABELS[topCatMonth[0] as keyof typeof CATEGORY_LABELS] ?? topCatMonth[0],
        description: `₹${topCatMonth[1].toLocaleString('en-IN')} spent this month`,
      }] : []),
      ...(topCatAll ? [{
        type: 'neutral' as const,
        icon: 'trending-up',
        title: 'All-Time Top Category',
        value: CATEGORY_LABELS[topCatAll[0] as keyof typeof CATEGORY_LABELS] ?? topCatAll[0],
        description: `₹${topCatAll[1].toLocaleString('en-IN')} total across all time`,
      }] : []),
      {
        type: expChange <= 0 ? 'positive' : 'warning',
        icon: expChange <= 0 ? 'trending-down' : 'trending-up',
        title: 'Expense vs Last Month',
        value: `${expChange > 0 ? '+' : ''}${expChange}%`,
        description: expChange <= 0
          ? `Expenses down — saved ₹${Math.abs(thisExpenses - lastExpenses).toLocaleString('en-IN')}`
          : `Expenses up ₹${Math.abs(thisExpenses - lastExpenses).toLocaleString('en-IN')} vs last month.`,
      },
      {
        type: incChange >= 0 ? 'positive' : 'warning',
        icon: 'dollar',
        title: 'Income vs Last Month',
        value: `${incChange >= 0 ? '+' : ''}${incChange}%`,
        description: incChange >= 0
          ? `Income up ₹${Math.abs(thisIncome - lastIncome).toLocaleString('en-IN')}`
          : `Income fell ₹${Math.abs(thisIncome - lastIncome).toLocaleString('en-IN')}`,
      },
      ...(biggestExp ? [{
        type: 'neutral' as const,
        icon: 'alert',
        title: 'Largest Expense',
        value: `₹${biggestExp.amount.toLocaleString('en-IN')}`,
        description: `${biggestExp.description} · ${new Date(biggestExp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
      }] : []),
      {
        type: 'neutral',
        icon: 'activity',
        title: 'Avg Monthly Expense',
        value: `₹${avgMonthlyExpense.toLocaleString('en-IN')}`,
        description: `Across ${allMonthlyExpenses} month${allMonthlyExpenses !== 1 ? 's' : ''} of data`,
      },
    ];
  }

  private buildBarChart(): void {
    this.barChart?.destroy();
    if (!this.barChartRef) return;
    const data = this.monthlyData.slice(-6);
    const ctx  = this.barChartRef.nativeElement.getContext('2d')!;

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.month),
        datasets: [
          { label: 'Income',   data: data.map(d => d.income),   backgroundColor: 'rgba(52,211,153,0.75)',  borderColor: '#34d399', borderWidth: 1, borderRadius: 4 },
          { label: 'Expenses', data: data.map(d => d.expenses), backgroundColor: 'rgba(248,113,113,0.75)', borderColor: '#f87171', borderWidth: 1, borderRadius: 4 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', align: 'end', labels: { color: '#7a8faa', usePointStyle: true, pointStyle: 'circle', boxWidth: 8, font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 } } },
          tooltip: { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-light)', borderWidth: 1, titleColor: '#e8edf5', bodyColor: '#7a8faa', padding: 12, callbacks: { label: ctx => ` ₹${(ctx.raw as number)?.toLocaleString('en-IN')}` } }
        },
        scales: {
          x: { grid: { color: 'rgba(31,45,69,0.5)' }, ticks: { color: '#4a5f7a', font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } } },
          y: { grid: { color: 'rgba(31,45,69,0.5)' }, ticks: { color: '#4a5f7a', font: { family: "'DM Mono', monospace", size: 11 }, callback: v => `₹${Number(v).toLocaleString('en-IN')}` } }
        }
      }
    });
  }

  private buildAreaChart(): void {
    this.areaChart?.destroy();
    if (!this.areaChartRef) return;
    const data = this.monthlyData.slice(-6);
    const ctx  = this.areaChartRef.nativeElement.getContext('2d')!;

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(245,166,35,0.25)');
    gradient.addColorStop(1, 'rgba(245,166,35,0)');

    this.areaChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.month),
        datasets: [{
          label: 'Net Savings',
          data: data.map(d => d.balance),
          borderColor: '#f5a623',
          backgroundColor: gradient,
          borderWidth: 2.5, fill: true, tension: 0.4,
          pointBackgroundColor: data.map(d => d.balance >= 0 ? '#f5a623' : '#f87171'),
          pointBorderColor: 'var(--bg-surface)',
          pointRadius: 5, pointHoverRadius: 8,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-light)', borderWidth: 1, titleColor: '#e8edf5', bodyColor: '#7a8faa', padding: 12, callbacks: { label: ctx => { const v = ctx.raw as number; return ` ${v >= 0 ? '+' : ''}₹${v.toLocaleString('en-IN')}`; } } }
        },
        scales: {
          x: { grid: { color: 'rgba(31,45,69,0.5)' }, ticks: { color: '#4a5f7a', font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } } },
          y: { grid: { color: 'rgba(31,45,69,0.5)' }, ticks: { color: '#4a5f7a', font: { family: "'DM Mono', monospace", size: 11 }, callback: v => `₹${Number(v).toLocaleString('en-IN')}` } }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.barChart?.destroy();
    this.areaChart?.destroy();
  }
}
