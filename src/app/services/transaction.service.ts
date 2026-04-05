import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';

import { StorageService } from './storage.service';
import { TransactionType, TransactionCategory, Transaction, MonthlyData, CategoryBreakdown, CATEGORY_LABELS, CATEGORY_COLORS } from '../models/transaction.model';

export interface TransactionFilters {
  search: string;
  type: TransactionType | 'all';
  category: TransactionCategory | 'all';
  dateFrom: string;
  dateTo: string;
  sortBy: 'date' | 'amount' | 'description';
  sortDir: 'asc' | 'desc';
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  transactionCount: number;
  incomeChange: number;
  expenseChange: number;
}

/** Build dates relative to today so seed data always appears in the correct month/year */
function makeDate(monthsAgo: number, day: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - monthsAgo, day);
}

function buildSeedTransactions(): Transaction[] {
  return [
    // ── Current Month ──────────────────────────────────────────
    { id: 's1',  date: makeDate(0, 1),  description: 'Monthly Salary',          amount: 85000, category: 'salary',        type: 'income'  },
    { id: 's2',  date: makeDate(0, 2),  description: 'Apartment Rent',          amount: 22000, category: 'housing',       type: 'expense' },
    { id: 's3',  date: makeDate(0, 3),  description: 'Swiggy Groceries',        amount: 3200,  category: 'food',          type: 'expense' },
    { id: 's4',  date: makeDate(0, 4),  description: 'Netflix + Hotstar',       amount: 799,   category: 'entertainment', type: 'expense' },
    { id: 's5',  date: makeDate(0, 5),  description: 'Freelance UI Project',    amount: 15000, category: 'freelance',     type: 'income'  },
    { id: 's6',  date: makeDate(0, 6),  description: 'Ola Cab Rides',           amount: 1800,  category: 'transport',     type: 'expense' },
    { id: 's7',  date: makeDate(0, 8),  description: 'Electricity Bill',        amount: 2100,  category: 'utilities',     type: 'expense' },
    { id: 's8',  date: makeDate(0, 9),  description: 'Amazon Shopping',         amount: 4500,  category: 'shopping',      type: 'expense' },
    { id: 's9',  date: makeDate(0, 10), description: 'Investment Return',       amount: 6200,  category: 'investment',    type: 'income'  },
    { id: 's10', date: makeDate(0, 11), description: 'Doctor Visit + Medicine', amount: 1650,  category: 'healthcare',    type: 'expense' },
    { id: 's11', date: makeDate(0, 13), description: 'Weekend Dining Out',      amount: 2800,  category: 'food',          type: 'expense' },
    { id: 's12', date: makeDate(0, 15), description: 'Udemy Course Bundle',     amount: 3499,  category: 'education',     type: 'expense' },
    { id: 's13', date: makeDate(0, 17), description: 'Freelance API Work',      amount: 8000,  category: 'freelance',     type: 'income'  },
    { id: 's14', date: makeDate(0, 19), description: 'Metro Monthly Pass',      amount: 1200,  category: 'transport',     type: 'expense' },
    { id: 's15', date: makeDate(0, 21), description: 'Internet Bill',           amount: 999,   category: 'utilities',     type: 'expense' },
    { id: 's16', date: makeDate(0, 22), description: 'Book Store',              amount: 650,   category: 'education',     type: 'expense' },
    { id: 's17', date: makeDate(0, 24), description: 'Birthday Gift Received',  amount: 5000,  category: 'gift',          type: 'income'  },
    { id: 's18', date: makeDate(0, 26), description: 'Gym Membership',          amount: 2500,  category: 'healthcare',    type: 'expense' },
    { id: 's19', date: makeDate(0, 28), description: 'Flight Tickets',          amount: 8200,  category: 'travel',        type: 'expense' },
    { id: 's20', date: makeDate(0, 28), description: 'Dividend Income',         amount: 3400,  category: 'investment',    type: 'income'  },

    // ── 1 Month Ago ────────────────────────────────────────────
    { id: 's21', date: makeDate(1, 1),  description: 'Monthly Salary',          amount: 85000, category: 'salary',        type: 'income'  },
    { id: 's22', date: makeDate(1, 3),  description: 'Apartment Rent',          amount: 22000, category: 'housing',       type: 'expense' },
    { id: 's23', date: makeDate(1, 5),  description: 'Zomato Orders',           amount: 4100,  category: 'food',          type: 'expense' },
    { id: 's24', date: makeDate(1, 7),  description: 'Freelance Dashboard UI',  amount: 18000, category: 'freelance',     type: 'income'  },
    { id: 's25', date: makeDate(1, 9),  description: 'Electricity Bill',        amount: 1850,  category: 'utilities',     type: 'expense' },
    { id: 's26', date: makeDate(1, 10), description: 'Petrol',                  amount: 2200,  category: 'transport',     type: 'expense' },
    { id: 's27', date: makeDate(1, 12), description: 'Movie + Dinner',          amount: 1950,  category: 'entertainment', type: 'expense' },
    { id: 's28', date: makeDate(1, 14), description: 'Mobile Recharge',         amount: 399,   category: 'utilities',     type: 'expense' },
    { id: 's29', date: makeDate(1, 16), description: 'Investment Return',       amount: 4800,  category: 'investment',    type: 'income'  },
    { id: 's30', date: makeDate(1, 18), description: 'Flipkart Sale',           amount: 6200,  category: 'shopping',      type: 'expense' },
    { id: 's31', date: makeDate(1, 20), description: 'Dental Checkup',          amount: 900,   category: 'healthcare',    type: 'expense' },
    { id: 's32', date: makeDate(1, 22), description: 'Freelance Mobile App',    amount: 10000, category: 'freelance',     type: 'income'  },
    { id: 's33', date: makeDate(1, 25), description: 'Weekend Trip',            amount: 5500,  category: 'travel',        type: 'expense' },
    { id: 's34', date: makeDate(1, 27), description: 'AWS Certificate Course',  amount: 2999,  category: 'education',     type: 'expense' },
    { id: 's35', date: makeDate(1, 28), description: 'Stock Dividend',          amount: 2100,  category: 'investment',    type: 'income'  },

    // ── 2 Months Ago ───────────────────────────────────────────
    { id: 's36', date: makeDate(2, 1),  description: 'Monthly Salary',          amount: 85000, category: 'salary',        type: 'income'  },
    { id: 's37', date: makeDate(2, 3),  description: 'Apartment Rent',          amount: 22000, category: 'housing',       type: 'expense' },
    { id: 's38', date: makeDate(2, 5),  description: 'Groceries',               amount: 3800,  category: 'food',          type: 'expense' },
    { id: 's39', date: makeDate(2, 7),  description: 'Freelance Design Work',   amount: 12000, category: 'freelance',     type: 'income'  },
    { id: 's40', date: makeDate(2, 9),  description: 'Electricity Bill',        amount: 2300,  category: 'utilities',     type: 'expense' },
    { id: 's41', date: makeDate(2, 11), description: 'Special Dinner',          amount: 3500,  category: 'food',          type: 'expense' },
    { id: 's42', date: makeDate(2, 13), description: 'Shopping Mall',           amount: 8900,  category: 'shopping',      type: 'expense' },
    { id: 's43', date: makeDate(2, 15), description: 'SIP – Mutual Fund',       amount: 5000,  category: 'investment',    type: 'expense' },
    { id: 's44', date: makeDate(2, 17), description: 'Gift Received',           amount: 10000, category: 'gift',          type: 'income'  },
    { id: 's45', date: makeDate(2, 20), description: 'Ola & Metro',             amount: 1600,  category: 'transport',     type: 'expense' },
    { id: 's46', date: makeDate(2, 22), description: 'Concert Tickets',         amount: 2000,  category: 'entertainment', type: 'expense' },
    { id: 's47', date: makeDate(2, 25), description: 'Doctor Consultation',     amount: 500,   category: 'healthcare',    type: 'expense' },
    { id: 's48', date: makeDate(2, 27), description: 'Investment Profit',       amount: 3200,  category: 'investment',    type: 'income'  },

    // ── 3 Months Ago ───────────────────────────────────────────
    { id: 's49', date: makeDate(3, 1),  description: 'Monthly Salary',          amount: 80000, category: 'salary',        type: 'income'  },
    { id: 's50', date: makeDate(3, 3),  description: 'Apartment Rent',          amount: 20000, category: 'housing',       type: 'expense' },
    { id: 's51', date: makeDate(3, 5),  description: 'Grocery Shopping',        amount: 4200,  category: 'food',          type: 'expense' },
    { id: 's52', date: makeDate(3, 7),  description: 'Freelance Work',          amount: 9000,  category: 'freelance',     type: 'income'  },
    { id: 's53', date: makeDate(3, 10), description: 'Internet + Electricity',  amount: 3100,  category: 'utilities',     type: 'expense' },
    { id: 's54', date: makeDate(3, 12), description: 'Ride Sharing',            amount: 2100,  category: 'transport',     type: 'expense' },
    { id: 's55', date: makeDate(3, 15), description: 'OTT Subscriptions',       amount: 999,   category: 'entertainment', type: 'expense' },
    { id: 's56', date: makeDate(3, 18), description: 'Investment Gain',         amount: 5500,  category: 'investment',    type: 'income'  },
    { id: 's57', date: makeDate(3, 20), description: 'Pharmacy',                amount: 850,   category: 'healthcare',    type: 'expense' },
    { id: 's58', date: makeDate(3, 22), description: 'Online Shopping',         amount: 3600,  category: 'shopping',      type: 'expense' },
    { id: 's59', date: makeDate(3, 25), description: 'Online Course',           amount: 1999,  category: 'education',     type: 'expense' },
    { id: 's60', date: makeDate(3, 27), description: 'Weekend Trip',            amount: 6800,  category: 'travel',        type: 'expense' },

    // ── 4 Months Ago ───────────────────────────────────────────
    { id: 's61', date: makeDate(4, 1),  description: 'Monthly Salary',          amount: 80000, category: 'salary',        type: 'income'  },
    { id: 's62', date: makeDate(4, 3),  description: 'Apartment Rent',          amount: 20000, category: 'housing',       type: 'expense' },
    { id: 's63', date: makeDate(4, 5),  description: 'Food & Dining',           amount: 5100,  category: 'food',          type: 'expense' },
    { id: 's64', date: makeDate(4, 7),  description: 'Client Project',          amount: 14000, category: 'freelance',     type: 'income'  },
    { id: 's65', date: makeDate(4, 9),  description: 'Utility Bills',           amount: 2700,  category: 'utilities',     type: 'expense' },
    { id: 's66', date: makeDate(4, 12), description: 'Transport Expenses',      amount: 1900,  category: 'transport',     type: 'expense' },
    { id: 's67', date: makeDate(4, 15), description: 'Streaming Services',      amount: 799,   category: 'entertainment', type: 'expense' },
    { id: 's68', date: makeDate(4, 18), description: 'Dividend',                amount: 4100,  category: 'investment',    type: 'income'  },
    { id: 's69', date: makeDate(4, 20), description: 'Gym + Health',            amount: 3200,  category: 'healthcare',    type: 'expense' },
    { id: 's70', date: makeDate(4, 22), description: 'Clothing Shopping',       amount: 5400,  category: 'shopping',      type: 'expense' },
    { id: 's71', date: makeDate(4, 25), description: 'Certification Exam',      amount: 4500,  category: 'education',     type: 'expense' },
    { id: 's72', date: makeDate(4, 28), description: 'Holiday Travel',          amount: 12000, category: 'travel',        type: 'expense' },

    // ── 5 Months Ago ───────────────────────────────────────────
    { id: 's73', date: makeDate(5, 1),  description: 'Monthly Salary',          amount: 78000, category: 'salary',        type: 'income'  },
    { id: 's74', date: makeDate(5, 3),  description: 'Apartment Rent',          amount: 20000, category: 'housing',       type: 'expense' },
    { id: 's75', date: makeDate(5, 5),  description: 'Grocery & Dining',        amount: 4600,  category: 'food',          type: 'expense' },
    { id: 's76', date: makeDate(5, 7),  description: 'Freelance Consulting',    amount: 11000, category: 'freelance',     type: 'income'  },
    { id: 's77', date: makeDate(5, 10), description: 'Monthly Bills',           amount: 2500,  category: 'utilities',     type: 'expense' },
    { id: 's78', date: makeDate(5, 12), description: 'Commute Expenses',        amount: 1700,  category: 'transport',     type: 'expense' },
    { id: 's79', date: makeDate(5, 15), description: 'Entertainment',           amount: 2300,  category: 'entertainment', type: 'expense' },
    { id: 's80', date: makeDate(5, 18), description: 'Portfolio Returns',       amount: 7200,  category: 'investment',    type: 'income'  },
    { id: 's81', date: makeDate(5, 20), description: 'Medical Checkup',         amount: 1200,  category: 'healthcare',    type: 'expense' },
    { id: 's82', date: makeDate(5, 22), description: 'E-commerce',              amount: 4200,  category: 'shopping',      type: 'expense' },
    { id: 's83', date: makeDate(5, 25), description: 'Books & Learning',        amount: 1500,  category: 'education',     type: 'expense' },
    { id: 's84', date: makeDate(5, 27), description: 'Weekend Getaway',         amount: 7500,  category: 'travel',        type: 'expense' },
  ];
}

function reviveDates(txns: Transaction[]): Transaction[] {
  return txns.map(t => ({ ...t, date: new Date(t.date) }));
}

/** Check if stored data is still fresh (seed IDs start with 's').
 *  If the month of the first seed transaction doesn't match current month,
 *  the seed is stale and we regenerate. */
function isSeedStale(stored: Transaction[]): boolean {
  const firstSeed = stored.find(t => t.id.startsWith('s'));
  if (!firstSeed) return false; // user-only data, keep it
  const now = new Date();
  const d   = new Date(firstSeed.date);
  return d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear();
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private _transactions$ = new BehaviorSubject<Transaction[]>(this.loadInitialData());

  constructor(private storage: StorageService) {}

  private loadInitialData(): Transaction[] {
    const storedRaw = this.storage.get<Transaction[]>('transactions');
    if (storedRaw && !isSeedStale(storedRaw)) {
      // Valid stored data — use it
      return reviveDates(storedRaw);
    } else {
      // No stored data, or seed dates are stale → regenerate seed
      const fresh = buildSeedTransactions();
      this.storage.set('transactions', fresh);
      return fresh;
    }
  }

  private _filters$ = new BehaviorSubject<TransactionFilters>(
    this.storage.get<TransactionFilters>('filters') ?? {
      search: '', type: 'all', category: 'all',
      dateFrom: '', dateTo: '', sortBy: 'date', sortDir: 'desc'
    }
  );

  private _undoStack: Transaction[][] = [];
  private readonly MAX_UNDO = 10;

  transactions$         = this._transactions$.asObservable();
  filters$              = this._filters$.asObservable();

  filteredTransactions$: Observable<Transaction[]> = combineLatest([
    this._transactions$, this._filters$
  ]).pipe(map(([txns, filters]) => this.applyFilters(txns, filters)));

  summary$: Observable<FinancialSummary> = this._transactions$.pipe(
    map(txns => this.computeSummary(txns))
  );

  monthlyData$: Observable<MonthlyData[]> = this._transactions$.pipe(
    map(txns => this.computeMonthlyData(txns))
  );

  /** Category breakdown — uses ALL transactions, not just current month */
  categoryBreakdown$: Observable<CategoryBreakdown[]> = this._transactions$.pipe(
    map(txns => this.computeCategoryBreakdown(txns))
  );

  /** All-time category breakdown for insights */
  allTimeCategoryBreakdown$: Observable<CategoryBreakdown[]> = this._transactions$.pipe(
    map(txns => this.computeCategoryBreakdown(txns, false))
  );

  get filters() { return this._filters$.getValue(); }
  get canUndo(): boolean { return this._undoStack.length > 0; }

  // ── Filters ───────────────────────────────────────────────
  setFilter(partial: Partial<TransactionFilters>): void {
    const next = { ...this.filters, ...partial };
    this._filters$.next(next);
    this.storage.set('filters', next);
  }

  resetFilters(): void {
    const def: TransactionFilters = {
      search: '', type: 'all', category: 'all',
      dateFrom: '', dateTo: '', sortBy: 'date', sortDir: 'desc'
    };
    this._filters$.next(def);
    this.storage.set('filters', def);
  }

  // ── CRUD ──────────────────────────────────────────────────
  addTransaction(tx: Omit<Transaction, 'id'>): Transaction {
    this.pushUndo();
    const newTx: Transaction = { ...tx, id: `u_${Date.now()}` };
    this.commit([newTx, ...this._transactions$.getValue()]);
    return newTx;
  }

  updateTransaction(id: string, tx: Partial<Transaction>): void {
    this.pushUndo();
    this.commit(this._transactions$.getValue().map(t => t.id === id ? { ...t, ...tx } : t));
  }

  deleteTransaction(id: string): Transaction | undefined {
    this.pushUndo();
    const current = this._transactions$.getValue();
    const deleted  = current.find(t => t.id === id);
    this.commit(current.filter(t => t.id !== id));
    return deleted;
  }

  restoreTransaction(tx: Transaction): void {
    this.commit([tx, ...this._transactions$.getValue()]);
  }

  undo(): void {
    const prev = this._undoStack.pop();
    if (prev) this.commit(prev, false);
  }

  resetToSeed(): void {
    this.pushUndo();
    const fresh = buildSeedTransactions();
    this.commit(fresh);
  }

  private pushUndo(): void {
    this._undoStack.push(this._transactions$.getValue());
    if (this._undoStack.length > this.MAX_UNDO) this._undoStack.shift();
  }

  private commit(txns: Transaction[], persist = true): void {
    this._transactions$.next(txns);
    if (persist) this.storage.set('transactions', txns);
  }

  // ── Computations ──────────────────────────────────────────
  private applyFilters(txns: Transaction[], f: TransactionFilters): Transaction[] {
    let result = [...txns];
    if (f.search) {
      const q = f.search.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(q) ||
        (CATEGORY_LABELS[t.category] ?? '').toLowerCase().includes(q) ||
        t.amount.toString().includes(q)
      );
    }
    if (f.type !== 'all')     result = result.filter(t => t.type === f.type);
    if (f.category !== 'all') result = result.filter(t => t.category === f.category);
    if (f.dateFrom) result = result.filter(t => new Date(t.date) >= new Date(f.dateFrom));
    if (f.dateTo)   result = result.filter(t => new Date(t.date) <= new Date(f.dateTo));

    result.sort((a, b) => {
      let cmp = 0;
      if (f.sortBy === 'date')        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (f.sortBy === 'amount') cmp = a.amount - b.amount;
      else                            cmp = a.description.localeCompare(b.description);
      return f.sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }

  private computeSummary(txns: Transaction[]): FinancialSummary {
    const now = new Date();

    const inMonth = (d: Date, monthsAgo: number) => {
      const ref = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
      return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
    };

    const thisMonth = txns.filter(t => inMonth(new Date(t.date), 0));
    const lastMonth = txns.filter(t => inMonth(new Date(t.date), 1));

    const income   = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const lIncome  = lastMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const lExpense = lastMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const totalIncome   = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return {
      totalBalance:    totalIncome - totalExpenses,
      totalIncome:     income,
      totalExpenses:   expenses,
      savingsRate:     income > 0 ? Math.round(((income - expenses) / income) * 100) : 0,
      transactionCount: thisMonth.length,
      incomeChange:    lIncome  > 0 ? Math.round(((income   - lIncome)  / lIncome)  * 100) : 0,
      expenseChange:   lExpense > 0 ? Math.round(((expenses - lExpense) / lExpense) * 100) : 0,
    };
  }

  private computeMonthlyData(txns: Transaction[]): MonthlyData[] {
    const months = new Map<string, { income: number; expenses: number }>();
    const ML = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    txns.forEach(t => {
      const d   = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      if (!months.has(key)) months.set(key, { income: 0, expenses: 0 });
      const m = months.get(key)!;
      if (t.type === 'income') m.income += t.amount; else m.expenses += t.amount;
    });

    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { income, expenses }]) => {
        const [year, mo] = key.split('-').map(Number);
        return { month: `${ML[mo]} ${year}`, income, expenses, balance: income - expenses };
      });
  }

  /**
   * @param currentMonthOnly  true = current month only (dashboard donut)
   *                          false = all-time (insights deep dive)
   */
  private computeCategoryBreakdown(txns: Transaction[], currentMonthOnly = true): CategoryBreakdown[] {
    let expenses: Transaction[];

    if (currentMonthOnly) {
      const now = new Date();
      expenses = txns.filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear();
      });
    } else {
      expenses = txns.filter(t => t.type === 'expense');
    }

    const totals = new Map<string, number>();
    expenses.forEach(t => totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount));

    const total = [...totals.values()].reduce((s, v) => s + v, 0);

    return Array.from(totals.entries())
      .map(([cat, amount]) => ({
        category:   CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        color:      CATEGORY_COLORS[cat] ?? '#94a3b8',
      }))
      .sort((a, b) => b.amount - a.amount);
  }
}
