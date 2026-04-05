import { Injectable } from '@angular/core';
import { Transaction, CATEGORY_LABELS } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportCSV(transactions: Transaction[], filename = 'finboard-transactions'): void {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (INR)', 'Notes'];

    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString('en-IN'),
      `"${t.description.replace(/"/g, '""')}"`,
      CATEGORY_LABELS[t.category] ?? t.category,
      t.type,
      t.amount.toString(),
      t.notes ? `"${t.notes.replace(/"/g, '""')}"` : '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  exportJSON(transactions: Transaction[], filename = 'finboard-transactions'): void {
    const data = transactions.map(t => ({
      ...t,
      date: new Date(t.date).toISOString().split('T')[0],
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
