import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { TransactionService } from './transaction.service';
import { Budget, BudgetStatus } from '../models/budget.model';
import { TransactionCategory, CATEGORY_LABELS } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private _budgets$ = new BehaviorSubject<Budget[]>(
    this.storage.get<Budget[]>('budgets') ?? []
  );

  budgets$ = this._budgets$.asObservable();

  budgetStatuses$: Observable<BudgetStatus[]> = combineLatest([
    this._budgets$,
    this.txService.transactions$,
  ]).pipe(
    map(([budgets, txns]) => {
      const now = new Date();
      const currentMonth = this.monthKey(now);

      return budgets
        .filter(b => b.month === currentMonth)
        .map(b => {
          const spent = txns
            .filter(t => {
              const d = new Date(t.date);
              return t.type === 'expense' &&
                t.category === b.category &&
                this.monthKey(d) === currentMonth;
            })
            .reduce((s, t) => s + t.amount, 0);

          const percentage = b.limit > 0 ? Math.min(Math.round((spent / b.limit) * 100), 999) : 0;

          return {
            ...b,
            spent,
            remaining:  Math.max(0, b.limit - spent),
            percentage,
            isOver:     spent > b.limit,
          };
        })
        .sort((a, b) => b.percentage - a.percentage);
    })
  );

  expenseCategories: TransactionCategory[] = [
    'food', 'transport', 'housing', 'utilities', 'entertainment',
    'healthcare', 'shopping', 'education', 'travel', 'other-expense',
  ];

  CATEGORY_LABELS = CATEGORY_LABELS;

  constructor(
    private storage: StorageService,
    private txService: TransactionService
  ) {}

  get currentMonthKey(): string {
    return this.monthKey(new Date());
  }

  private monthKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  setBudget(category: TransactionCategory, limit: number): void {
    const month   = this.currentMonthKey;
    const budgets = this._budgets$.getValue();
    const idx     = budgets.findIndex(b => b.category === category && b.month === month);

    const updated = idx >= 0
      ? budgets.map((b, i) => i === idx ? { ...b, limit } : b)
      : [...budgets, { category, limit, month }];

    this._budgets$.next(updated);
    this.storage.set('budgets', updated);
  }

  removeBudget(category: TransactionCategory): void {
    const month   = this.currentMonthKey;
    const updated = this._budgets$.getValue()
      .filter(b => !(b.category === category && b.month === month));
    this._budgets$.next(updated);
    this.storage.set('budgets', updated);
  }

  getBudgetForCategory(category: TransactionCategory): Budget | undefined {
    return this._budgets$.getValue()
      .find(b => b.category === category && b.month === this.currentMonthKey);
  }
}
