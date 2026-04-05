import { TransactionCategory } from './transaction.model';

export interface Budget {
  category: TransactionCategory;
  limit: number;
  month: string; // 'YYYY-MM'
}

export interface BudgetStatus extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  isOver: boolean;
}
