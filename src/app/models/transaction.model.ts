export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'salary' | 'freelance' | 'investment' | 'gift' | 'other-income'
  | 'food' | 'transport' | 'housing' | 'utilities' | 'entertainment'
  | 'healthcare' | 'shopping' | 'education' | 'travel' | 'other-expense';

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  notes?: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  'salary':         'Salary',
  'freelance':      'Freelance',
  'investment':     'Investment',
  'gift':           'Gift',
  'other-income':   'Other Income',
  'food':           'Food & Dining',
  'transport':      'Transport',
  'housing':        'Housing',
  'utilities':      'Utilities',
  'entertainment':  'Entertainment',
  'healthcare':     'Healthcare',
  'shopping':       'Shopping',
  'education':      'Education',
  'travel':         'Travel',
  'other-expense':  'Other Expense',
};

export const CATEGORY_COLORS: Record<string, string> = {
  'salary':        '#f5a623',
  'freelance':     '#f7b84b',
  'investment':    '#fcd68a',
  'gift':          '#f9c55d',
  'other-income':  '#e8a82f',
  'food':          '#f87171',
  'transport':     '#fb923c',
  'housing':       '#a78bfa',
  'utilities':     '#60a5fa',
  'entertainment': '#34d399',
  'healthcare':    '#22d3ee',
  'shopping':      '#f472b6',
  'education':     '#818cf8',
  'travel':        '#4ade80',
  'other-expense': '#94a3b8',
};

export type AppRole = 'viewer' | 'admin';
