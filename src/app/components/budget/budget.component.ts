import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { BudgetService } from '../../services/budget.service';
import { ToastService } from '../../services/toast.service';
import { RoleService } from '../../services/role.service';
import { BudgetStatus } from '../../models/budget.model';
import { TransactionCategory, CATEGORY_LABELS } from '../../models/transaction.model';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit, OnDestroy {
  @Input() standalone = false;

  private destroy$ = new Subject<void>();

  budgetStatuses: BudgetStatus[] = [];
  isAdmin = false;
  showForm = false;
  form!: FormGroup;

  expenseCategories = this.budgetService.expenseCategories;
  CATEGORY_LABELS   = CATEGORY_LABELS;
  Math = Math;

  get currentMonth(): string {
    return new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  }

  constructor(
    private budgetService: BudgetService,
    private toastService: ToastService,
    private roleService: RoleService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Support both @Input and route data for standalone mode
    this.route.data.pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data['standalone']) this.standalone = true;
      });

    this.budgetService.budgetStatuses$.pipe(takeUntil(this.destroy$))
      .subscribe(b => this.budgetStatuses = b);

    this.roleService.role$.pipe(takeUntil(this.destroy$))
      .subscribe(r => this.isAdmin = r === 'admin');

    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      category: ['food',  Validators.required],
      limit:    ['',     [Validators.required, Validators.min(1)]],
    });
  }

  submitBudget(): void {
    if (this.form.invalid) return;
    const { category, limit } = this.form.value;
    this.budgetService.setBudget(category as TransactionCategory, Number(limit));
    this.toastService.success(
      'Budget Set',
      `₹${Number(limit).toLocaleString('en-IN')} limit for ${CATEGORY_LABELS[category as TransactionCategory]}`
    );
    this.showForm = false;
    this.buildForm();
  }

  removeBudget(cat: TransactionCategory): void {
    this.budgetService.removeBudget(cat);
    this.toastService.info('Budget Removed', CATEGORY_LABELS[cat]);
  }

  getBarColor(status: BudgetStatus): string {
    if (status.isOver)           return '#f87171';
    if (status.percentage >= 80) return '#f5a623';
    return '#34d399';
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
