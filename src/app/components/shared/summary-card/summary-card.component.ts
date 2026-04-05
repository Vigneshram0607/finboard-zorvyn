import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-summary-card',
  template: `
    <div class="summary-card" [class]="variant">
      <div class="card-top">
        <div class="icon-wrap">
          <svg-icon [name]="icon" style="width:18px;height:18px"></svg-icon>
        </div>
        <div class="change-badge" *ngIf="change !== undefined"
          [class.positive]="change >= 0" [class.negative]="change < 0">
          <svg-icon [name]="change >= 0 ? 'arrow-up' : 'arrow-down'" style="width:11px;height:11px"></svg-icon>
          {{ change >= 0 ? '+' : '' }}{{ change }}%
        </div>
      </div>

      <div class="amount-wrap">
        <span class="currency">₹</span>
        <span class="amount" [countUp]="amount" [duration]="900" [prefix]="''"></span>
      </div>

      <div class="card-footer">
        <span class="label">{{ label }}</span>
        <span class="sub-label" *ngIf="subLabel">{{ subLabel }}</span>
      </div>

      <div class="card-glow"></div>
    </div>
  `,
  styles: [`
    .summary-card {
      position: relative;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: var(--shadow-card);
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      animation: fadeUp 0.4s ease both;
      overflow: hidden;
      cursor: default;

      &:hover {
        border-color: var(--border-light);
        transform: translateY(-3px);
        box-shadow: 0 12px 36px rgba(0,0,0,0.35);

        .card-glow { opacity: 1; }
      }

      &.balance {
        border-color: rgba(245,166,35,0.2);
        background: linear-gradient(135deg, var(--bg-surface), rgba(245,166,35,0.03));
        .icon-wrap { color: var(--accent-gold); background: rgba(245,166,35,0.12); }
        .card-glow { background: radial-gradient(ellipse at bottom right, rgba(245,166,35,0.08), transparent 70%); }
      }
      &.income {
        border-color: rgba(52,211,153,0.15);
        .icon-wrap { color: var(--income-color); background: rgba(52,211,153,0.1); }
        .card-glow { background: radial-gradient(ellipse at bottom right, rgba(52,211,153,0.06), transparent 70%); }
      }
      &.expense {
        border-color: rgba(248,113,113,0.15);
        .icon-wrap { color: var(--expense-color); background: rgba(248,113,113,0.1); }
        .card-glow { background: radial-gradient(ellipse at bottom right, rgba(248,113,113,0.06), transparent 70%); }
      }
      &.savings {
        border-color: rgba(34,211,238,0.15);
        .icon-wrap { color: var(--accent-teal); background: rgba(34,211,238,0.1); }
        .card-glow { background: radial-gradient(ellipse at bottom right, rgba(34,211,238,0.06), transparent 70%); }
      }
    }

    .card-glow {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
      border-radius: inherit;
    }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .icon-wrap {
      width: 38px; height: 38px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }

    .change-badge {
      display: flex; align-items: center; gap: 3px;
      font-size: 11px; font-weight: 700;
      padding: 3px 9px; border-radius: 100px;

      &.positive { color: var(--income-color); background: rgba(52,211,153,0.12); }
      &.negative { color: var(--expense-color); background: rgba(248,113,113,0.12); }
    }

    .amount-wrap {
      display: flex;
      align-items: baseline;
      gap: 2px;
    }

    .currency {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-muted);
      line-height: 1;
    }

    .amount {
      font-family: 'Outfit', sans-serif;
      font-size: 28px; font-weight: 800;
      letter-spacing: -0.04em;
      color: var(--text-primary);
      line-height: 1;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .label {
      font-size: 11px; font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase; letter-spacing: 0.06em;
    }

    .sub-label {
      font-size: 11px; color: var(--text-muted);
    }
  `]
})
export class SummaryCardComponent implements OnChanges {
  @Input() label    = '';
  @Input() amount   = 0;
  @Input() icon     = 'dollar';
  @Input() change?: number;
  @Input() subLabel?: string;
  @Input() variant: 'balance' | 'income' | 'expense' | 'savings' = 'balance';

  ngOnChanges(): void { /* triggers countUp re-animation via directive OnChanges */ }
}
