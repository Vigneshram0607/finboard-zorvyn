import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  Transaction, TransactionType, TransactionCategory,
  CATEGORY_LABELS, AppRole
} from '../../models/transaction.model';
import { TransactionService, TransactionFilters } from '../../services/transaction.service';
import { RoleService } from '../../services/role.service';
import { ToastService } from '../../services/toast.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  allTransactions: Transaction[] = [];
  transactions!: Transaction[];
  filters!: TransactionFilters;
  role: AppRole = 'viewer';
  showForm = false;
  editingId: string | null = null;
  deleteConfirmId: string | null = null;
  showExportMenu = false;
  isLoading = true;

  form!: FormGroup;
  CATEGORY_LABELS = CATEGORY_LABELS;
  Math = Math;

  incomeCategories: TransactionCategory[] = [
    'salary','freelance','investment','gift','other-income'
  ];
  expenseCategories: TransactionCategory[] = [
    'food','transport','housing','utilities','entertainment',
    'healthcare','shopping','education','travel','other-expense'
  ];

  sortOptions = [
    { value: 'date',        label: 'Date'   },
    { value: 'amount',      label: 'Amount' },
    { value: 'description', label: 'Name'   },
  ];

  get availableCategories(): TransactionCategory[] {
    return this.form?.get('type')?.value === 'income'
      ? this.incomeCategories : this.expenseCategories;
  }

  get isAdmin(): boolean { return this.role === 'admin'; }

  constructor(
    private txService: TransactionService,
    private roleService: RoleService,
    private toastService: ToastService,
    private exportService: ExportService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();

    this.roleService.role$.pipe(takeUntil(this.destroy$))
      .subscribe(r => this.role = r);

    this.txService.transactions$.pipe(takeUntil(this.destroy$))
      .subscribe(txns => {
        console.log(txns)
        this.allTransactions = txns;
        setTimeout(() => this.isLoading = false, 400);
      });

    this.txService.filteredTransactions$.pipe(takeUntil(this.destroy$))
      .subscribe(txns => this.transactions = txns);

    this.txService.filters$.pipe(takeUntil(this.destroy$))
      .subscribe(f => this.filters = f);
  }

  // ── Keyboard shortcuts ─────────────────────────────────────
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    const tag = (e.target as HTMLElement).tagName;
    if (['INPUT','SELECT','TEXTAREA'].includes(tag)) return;

    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      this.txService.undo();
      this.toastService.info('Undone', 'Last action reversed');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && this.isAdmin) {
      e.preventDefault();
      this.openAddForm();
    }
  }

  // ── Form ───────────────────────────────────────────────────
  private buildForm(tx?: Transaction): void {
    this.form = this.fb.group({
      description: [tx?.description ?? '', [Validators.required, Validators.minLength(2)]],
      amount:      [tx?.amount ?? '',      [Validators.required, Validators.min(1)]],
      type:        [tx?.type ?? 'expense', Validators.required],
      category:    [tx?.category ?? 'food', Validators.required],
      date:        [tx ? this.toDateString(tx.date) : this.toDateString(new Date()), Validators.required],
      notes:       [tx?.notes ?? ''],
    });
    this.form.get('type')?.valueChanges.subscribe(type => {
      const cats = type === 'income' ? this.incomeCategories : this.expenseCategories;
      if (!cats.includes(this.form.get('category')?.value)) {
        this.form.get('category')?.setValue(cats[0]);
      }
    });
  }

  private toDateString(d: Date): string {
    return new Date(d).toISOString().split('T')[0];
  }

  openAddForm(): void {
    this.editingId = null;
    this.buildForm();
    this.showForm = true;
  }

  openEditForm(tx: Transaction): void {
    this.editingId = tx.id;
    this.buildForm(tx);
    this.showForm = true;
  }

  closeForm(): void { this.showForm = false; this.editingId = null; }

  submitForm(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const payload = {
      description: v.description.trim(),
      amount:      Number(v.amount),
      type:        v.type as TransactionType,
      category:    v.category as TransactionCategory,
      date:        new Date(v.date),
      notes:       v.notes?.trim() || undefined,
    };

    if (this.editingId) {
      this.txService.updateTransaction(this.editingId, payload);
      this.toastService.success('Transaction Updated', payload.description);
    } else {
      this.txService.addTransaction(payload);
      this.toastService.success('Transaction Added',
        `${payload.type === 'income' ? '+' : '−'}₹${payload.amount.toLocaleString('en-IN')}`);
    }
    this.closeForm();
  }

  // ── Delete with Undo ───────────────────────────────────────
  confirmDelete(id: string): void { this.deleteConfirmId = id; }
  cancelDelete(): void            { this.deleteConfirmId = null; }

  deleteTransaction(): void {
    if (!this.deleteConfirmId) return;
    const deleted = this.txService.deleteTransaction(this.deleteConfirmId);
    this.deleteConfirmId = null;

    if (deleted) {
      this.toastService.success('Deleted', deleted.description, {
        label: 'Undo',
        fn: () => {
          this.txService.restoreTransaction(deleted);
          this.toastService.success('Restored', deleted.description);
        }
      });
    }
  }

  // ── Export ─────────────────────────────────────────────────
  exportCSV(): void {
    this.exportService.exportCSV(this.transactions);
    this.toastService.success('CSV Exported', `${this.transactions.length} transactions`);
    this.showExportMenu = false;
  }

  exportJSON(): void {
    this.exportService.exportJSON(this.transactions);
    this.toastService.success('JSON Exported', `${this.transactions.length} transactions`);
    this.showExportMenu = false;
  }

  // ── Filters ────────────────────────────────────────────────
  setSearch(v: string)   { this.txService.setFilter({ search: v }); }
  setType(v: string)     { this.txService.setFilter({ type: v as TransactionType | 'all' }); }
  setCategory(v: string) { this.txService.setFilter({ category: v as TransactionCategory | 'all' }); }
  setDateFrom(v: string) { this.txService.setFilter({ dateFrom: v }); }
  setDateTo(v: string)   { this.txService.setFilter({ dateTo: v }); }
  setSortBy(v: string)   { this.txService.setFilter({ sortBy: v as 'date'|'amount'|'description' }); }
  toggleSortDir(): void  { this.txService.setFilter({ sortDir: this.filters.sortDir === 'asc' ? 'desc' : 'asc' }); }
  resetFilters(): void   { this.txService.resetFilters(); }

  get filteredIncome(): number {
    return this.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  }

  get filteredExpenses(): number {
    return this.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  }

    get hasActiveFilters(): boolean {
    const f = this.filters;
    return !!(f.search || f.type !== 'all' || f.category !== 'all' || f.dateFrom || f.dateTo);
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  trackById(_: number, t: Transaction) { return t.id; }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
