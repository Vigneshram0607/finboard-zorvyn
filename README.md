<div align="center">

# FinBoard

### A Production-Grade Financial Dashboard

**Built with Angular 17 · TypeScript · Chart.js · RxJS**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-black?style=for-the-badge&logo=vercel)](https://finboard-zorvyn.vercel.app/dashboard)
[![Angular](https://img.shields.io/badge/Angular-17-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://chartjs.org)

> Assessment submission for **Zorvyn** — A complete financial tracking application featuring real-time analytics, role-based access control, full CRUD operations, dark/light theming, localStorage persistence, and a responsive UI that works seamlessly across every device.

[🚀 Live Demo](https://finboard-zorvyn.vercel.app/dashboard) &nbsp;·&nbsp; [🎬 Video Walkthrough](#-video-walkthrough) &nbsp;·&nbsp; [✨ Features](#-features) &nbsp;·&nbsp; [🏗 Architecture](#-architecture) &nbsp;·&nbsp; [🚀 Quick Start](#-quick-start)

</div>

---

## 🎬 Video Walkthrough

> 📹 **[Watch full walkthrough on YouTube →](https://youtube.com/your-link-here)**
> *A 5-minute end-to-end demo — all four pages, Admin/Viewer role switching, dark & light mode, mobile UX, keyboard shortcuts, and the undo system in action.*

<!-- Replace the GIF below with your recording -->
<!-- Recommended tools: Loom · Kap (macOS) · ScreenToGif (Windows) · peek (Linux) -->
<!-- Target size: 900×500 px · 15 fps · under 5 MB -->

![FinBoard App Demo](./assets/demo.gif)

---

## 📸 Screenshots

<details open>
<summary><strong>🏠 Dashboard</strong></summary>
<br>

<!-- Replace with your actual screenshots -->
![Dashboard Dark Mode](./assets/screenshots/dashboard-dark.png)
*Dark mode — animated KPI cards, 6-month trend chart, spending donut, top categories, and the budget widget all in one view*

![Dashboard Light Mode](./assets/screenshots/dashboard-light.png)
*Light mode — 26 CSS design tokens switch every colour simultaneously, zero page reload*

</details>

<details>
<summary><strong>💳 Transactions</strong></summary>
<br>

![Transactions Desktop](./assets/screenshots/transactions-desktop.png)
*Desktop — fixed-width columns, clickable sort headers, search highlighting, totals footer, and CSV export*

![Transactions Mobile](./assets/screenshots/transactions-mobile.png)
*Mobile — the table is fully replaced by a touch-optimised card list. The gold FAB handles adding transactions*

</details>

<details>
<summary><strong>📊 Insights</strong></summary>
<br>

![Insights Page](./assets/screenshots/insights.png)
*7 auto-computed insight cards, monthly bar chart, net savings area chart, and the all-time spending breakdown table*

</details>

<details>
<summary><strong>💰 Budgets</strong></summary>
<br>

![Budget Page](./assets/screenshots/budget.png)
*Monthly limits per category. Progress bars turn amber at 80%, red when exceeded — with exact overage amounts*

</details>

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

```bash
# 1. Clone the repository
git clone https://github.com/Vigneshram0607/finboard-zorvyn.git
cd finboard

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
# → http://localhost:2000
```

No backend. No environment variables. No configuration. Open the URL and everything works.

### Production Build

```bash
npm run build
# Output: /dist/finboard  —  ready to drop on any static host
```

### ⚠️ Important for Reviewers — Unlock Admin Features

The app launches in **Viewer** mode (read-only) to demonstrate RBAC. To access Add, Edit, Delete, and Budget management:

1. Open the **left sidebar**
2. Find the **Role** toggle at the bottom
3. Click **Admin**

Your role choice is saved to `localStorage` and persists across refreshes.

---

## ✨ Features

### 🏠 Dashboard
| Feature | Details |
|---|---|
| Animated KPI Cards | Total Balance · Monthly Income · Monthly Expenses · Savings Rate — numbers count up using a custom `CountUpDirective` (ease-out-cubic via `requestAnimationFrame`) |
| 6-Month Trend Chart | Line chart — income, expenses, and net balance. Net area fills with a colour gradient |
| Spending Donut | Top 5 expense categories for the current month with percentage tooltips |
| Recent Transactions | Last 6 entries, colour-coded by type |
| Category Bar Breakdown | Proportional bars showing where this month's money went |
| Budget Widget | Embedded monthly limits tracker — the same component that powers `/budget` |
| Skeleton Loaders | Shimmer placeholders during initial data load; no layout shift |

### 💳 Transactions
| Feature | Details |
|---|---|
| Full CRUD | Add · Edit · Delete via clean modal forms — Admin role only |
| Smart Search | Live full-text search with a custom `HighlightPipe` that wraps matched text in `<mark>` via `DomSanitizer` |
| Multi-Filter | Type + category + date range simultaneously. State persists to `localStorage` |
| Clickable Sort | Click any column header. Click again to toggle asc/desc. Active column shows a chevron icon |
| CSV Export | Downloads the **current filtered view** as a properly RFC-4180-escaped `.csv` |
| Undo Delete | Toast with an **Undo** action button. One click restores the deleted transaction with no confirmation dialog |
| Mobile FAB | Gold `position: fixed` floating action button — visible only on ≤768px |
| Mobile Card List | Table is replaced entirely on small screens with a touch-friendly card layout |
| Totals Footer | Table footer shows live income + expense subtotals that update as filters change |
| Keyboard Shortcuts | `Ctrl+N` opens the Add form · `Ctrl+Z` triggers undo from anywhere on the page |

### 📊 Insights
| Feature | Details |
|---|---|
| 7 Smart Insight Cards | Savings rate · top category this month · all-time top category · expense trend · income trend · largest expense · avg monthly expense |
| Card Severity Colours | Green = positive · Amber = warning · Teal = neutral — computed from real data |
| Monthly Bar Chart | Side-by-side income vs expense across all recorded months |
| Net Savings Area Chart | Monthly surplus/deficit trend — data points automatically turn red for negative months |
| All-Time Category Table | Aggregated from **all** transactions, not just the current month (separate `allTimeCategoryBreakdown$` stream) |
| Monthly Summary Table | Full history table — income, expenses, net — shown in reverse-chronological order |

### 💰 Budgets
| Feature | Details |
|---|---|
| Per-Category Limits | Set monthly spending limits for any expense category |
| Live Progress Bars | Animated fill · Green → Amber (>80%) → Red (>100%) |
| Over-Budget Alerts | Shows exact overage: "Over by ₹2,400" |
| Persistence | Budget limits stored in `localStorage`, restored on next visit |
| Dual-Mode Component | Same component embeds in Dashboard AND works as a standalone page at `/budget` via `@Input() standalone` |

### 🎨 UI & UX
| Feature | Details |
|---|---|
| Dark / Light Theme | Full token-based system — 26 CSS custom properties, all transitions smooth at 0.3s |
| Anti-Flash Script | Inline `<script>` in `index.html` applies the saved theme before Angular boots — zero white flash |
| OS Theme Detection | Reads `prefers-color-scheme` on first visit — correct theme before the user touches anything |
| Typography | Plus Jakarta Sans (body) · Outfit (headings) · DM Mono (numbers/mono) |
| Responsive Layout | Sidebar → slide-in drawer on mobile · desktop table → mobile card list with FAB |
| Stacked Toasts | Success / error / warning / info — auto-dismiss with optional action callbacks |
| Role Switcher | Persistent sidebar toggle. Switching from Viewer to Admin or back requires no reload |

---

## 🏗 Architecture

### State Management Philosophy

All state lives in injectable RxJS services. No NgRx — this was a deliberate decision. `BehaviorSubject` + `combineLatest` handles the full reactive graph without the boilerplate overhead of a full state management library.

```
TransactionService
 ├── _transactions$             BehaviorSubject<Transaction[]>   ← single source of truth
 ├── _filters$                  BehaviorSubject<TransactionFilters>
 │
 ├── filteredTransactions$      combineLatest([_transactions$, _filters$]).pipe(map(applyFilters))
 ├── summary$                   _transactions$.pipe(map(computeSummary))
 ├── monthlyData$               _transactions$.pipe(map(computeMonthlyData))
 ├── categoryBreakdown$         _transactions$.pipe(map(computeBreakdown))        ← current month only
 └── allTimeCategoryBreakdown$  _transactions$.pipe(map(computeBreakdown, false)) ← all months
```

One `next()` call on `_transactions$` propagates automatically to every chart, every card, and every table in the application — with no manual refresh logic anywhere.

### Versioned LocalStorage

```typescript
// StorageService
private prefix = 'finboard_v2';

// All keys: finboard_v2_transactions · finboard_v2_filters
//           finboard_v2_role · finboard_v2_theme · finboard_v2_budgets
```

Bumping the version string invalidates all stored data in one place — a practical migration strategy that works without a backend.

### Undo System — Snapshot Stack

```typescript
private _undoStack: Transaction[][] = [];
private readonly MAX_UNDO = 10;

private pushUndo(): void {
  this._undoStack.push(this._transactions$.getValue());
  if (this._undoStack.length > this.MAX_UNDO) this._undoStack.shift();
}

undo(): void {
  const prev = this._undoStack.pop();
  if (prev) this.commit(prev, false); // false = skip re-persisting to localStorage
}
```

Every `addTransaction`, `updateTransaction`, and `deleteTransaction` call pushes a snapshot first. Undo is instant — no network call, no confirmation dialog.



### Project Structure

```
src/
├── app/
│   ├── models/
│   │   ├── transaction.model.ts    Types · enums · 15 category labels · colour map
│   │   └── budget.model.ts         Budget and BudgetStatus interfaces
│   │
│   ├── services/                   7 focused single-responsibility services
│   │   ├── storage.service.ts      Versioned localStorage wrapper
│   │   ├── transaction.service.ts  Master state · CRUD · 10-deep undo · derived streams · seed
│   │   ├── budget.service.ts       Monthly budget management
│   │   ├── role.service.ts         RBAC role (persisted)
│   │   ├── theme.service.ts        Dark/light toggle + OS detection
│   │   ├── toast.service.ts        Notification queue with action callbacks
│   │   └── export.service.ts       CSV download with proper escaping
│   │
│   ├── components/
│   │   ├── dashboard/              Overview page
│   │   ├── transactions/           CRUD · sortable table · mobile cards · FAB
│   │   ├── insights/               Analytics · 7 insight cards · 2 charts · 2 tables
│   │   ├── budget/                 Budget tracker (standalone page + embedded widget)
│   │   └── shared/
│   │       ├── navbar/             Sidebar — theme switcher · role toggle · undo
│   │       ├── summary-card/       Animated KPI card
│   │       ├── toast/              Stacked notification host
│   │       ├── skeleton/           Shimmer loader
│   │       ├── svg-icon            30+ inline SVGs — no icon font HTTP request
│   │       ├── count-up.directive  [countUp]="n" — requestAnimationFrame counter
│   │       └── highlight.pipe      | highlight:'q' — regex + DomSanitizer
│   │
│   ├── app.component.ts            Shell · mobile header · global Ctrl+Z listener
│   ├── app.module.ts
│   └── app-routing.module.ts       4 routes · scrollPositionRestoration: 'top'
│
├── styles.scss                     26 design tokens · global resets · keyframe animations
└── index.html                      Anti-flash theme script · font preconnect hints
```

---

## 🛠 Tech Stack

| Concern | Technology | Version |
|---|---|---|
| Framework | Angular | 17.0 |
| Language | TypeScript (strict mode) | 5.2 |
| Charts | Chart.js | 4.4 |
| Reactive State | RxJS | 7.8 |
| Forms | Angular Reactive Forms | — |
| Styling | SCSS + CSS Custom Properties | — |
| Persistence | localStorage (via `StorageService`) | — |
| Deployment | Vercel | — |

---

## ✅ Assessment Requirements Checklist

| Requirement | Status | Implementation |
|---|:---:|---|
| Dashboard overview | ✅ | 4 KPI cards · trend chart · donut · recent transactions |
| Balance / Income / Expenses summary cards | ✅ | Animated with `CountUpDirective` · MoM % change badge |
| Time-based visualization | ✅ | 6-month income / expenses / net line chart |
| Categorical visualization | ✅ | Donut chart · proportional bar breakdown |
| Transaction list with date, amount, category, type | ✅ | All columns · fixed-width with `<colgroup>` |
| Filtering | ✅ | Type · category · date range · text search — all combined |
| Sorting or Search | ✅ | Clickable column headers · asc/desc toggle · live search |
| Role-based UI | ✅ | Viewer (read-only) vs Admin (full CRUD + budgets) |
| Role switching | ✅ | Sidebar toggle · persisted to `localStorage` |
| Insights section | ✅ | 7 insight cards · 2 charts · 2 data tables |
| Highest spending category | ✅ | Two insight cards: this month + all-time |
| Monthly comparison | ✅ | Bar chart + monthly summary table |
| State management | ✅ | RxJS `BehaviorSubject` — transactions · filters · role · theme |
| Clean & readable design | ✅ | Custom design system · 2 themes · premium fonts |
| Responsiveness | ✅ | Desktop table → mobile cards → FAB · collapsible sidebar |
| Empty / no-data states | ✅ | Handled gracefully in every component |

---

## 🌟 What Goes Beyond the Requirements

| Feature | Why It Was Added |
|---|---|
| `localStorage` persistence | State survives page refresh — a real app expectation |
| Versioned storage keys | Clean data migration without a backend |
| 10-deep Undo system | Prevents data loss; a professional UX standard |
| Dynamic seed dates | Charts are always populated, no matter when the app runs |
| Anti-flash theme script | Eliminates the white flash common in SPA theme implementations |
| OS theme preference detection | Correct theme before the user touches anything |
| Custom `CountUpDirective` | Built with `requestAnimationFrame` + ease-out-cubic — no third-party animation lib |
| Custom `HighlightPipe` | Regex match + `DomSanitizer` — search UX you'd find in production products |
| Skeleton loaders | Professional loading states; used in production by every major app |
| Toast with action callbacks | Undo is surfaced exactly where the action happened |
| Budget tracker | A complete extra feature beyond the spec |
| CSV export | Downloads exactly the filtered view, properly escaped |
| Mobile FAB + card list | Not just "responsive" — completely different layout on mobile |
| Keyboard shortcuts | Power-user experience, discoverable via the shortcuts hint bar |
| ViewEncapsulation `<colgroup>` fix | Non-obvious Angular quirk — solved correctly, not hacked around |

---

## 🔮 What Could Make This Even More Unique

The following improvements are identified for further development. Each addresses a real user need or demonstrates additional engineering depth.

### 🎯 High-Impact UX Features

| Improvement | What It Solves |
|---|---|
| **Recurring Transactions** | Users manually re-add the same rent/salary every month. Auto-schedule based on frequency (daily / weekly / monthly) |
| **Dashboard Date Range Picker** | "Current month" is too limiting. Let users analyse any custom month, quarter, or year |
| **Chart Drill-Down** | Clicking a donut slice filters the Transactions table to that category — connects the two pages |
| **Transaction Tags** | Free-form tags (`#essentials`, `#weekend`) for flexible grouping that goes beyond fixed categories |
| **Spending Goal Tracker** | Set savings targets (e.g., "Save ₹50,000 by December") with a progress ring |
| **Heatmap Calendar View** | GitHub-style calendar showing spending intensity per day — immediately reveals patterns |
| **Predictive Alerts** | "At this rate, you'll exceed your ₹5,000 food budget by the 22nd" — forward-looking insight |

### ⚙️ Technical Improvements

| Improvement | Technical Benefit |
|---|---|
| **PWA (Progressive Web App)** | Service Worker + manifest = installable on mobile home screen with offline support |
| **Angular Signals** | Migrate `BehaviorSubject` to Signals (Angular 17+) for finer-grained, simpler reactivity |
| **Lazy-Loaded Routes** | Split Insights and Budget into separate chunks — reduces initial bundle size significantly |
| **Virtual Scrolling** | `cdk-virtual-scroll` in the Transactions table — handles 10,000+ rows without freezing |
| **IndexedDB via Dexie.js** | Replace `localStorage` with a proper client-side database for larger datasets and queries |
| **Unit Tests** | Jasmine/Karma tests for `TransactionService` computation methods and custom directive/pipe |
| **E2E Tests** | Playwright or Cypress: Add transaction → filter → export → delete → undo full-flow test |
| **Strict OnPush CD** | Add `ChangeDetectionStrategy.OnPush` to all components for maximum render performance |

### 🎨 Design & Polish

| Improvement | User Experience Benefit |
|---|---|
| **Micro-animations on CRUD** | Row flash-highlight on add; slide-out on delete — makes state changes feel tangible |
| **Onboarding Tooltip Tour** | First-visit overlay explaining each section — removes friction for new users |
| **Saved Filter Presets** | Name and save filter combinations: "This Month Food", "All Income" — one click to restore |
| **Print / PDF Report** | `window.print()` with print-specific CSS — formatted monthly financial statement |
| **Transaction Import (CSV Upload)** | Upload a bank statement CSV and auto-parse it — the most-requested feature in any finance app |
| **Sankey Flow Diagram** | Visualise: Total Income → Tax → Savings → each Expense Category as a flow diagram |

### 🤖 Advanced / AI Features

| Improvement | Why It Would Stand Out |
|---|---|
| **Smart Category Suggestion** | Type a description like "Swiggy order" and the app auto-suggests the category using fuzzy matching |
| **Spending Personality Report** | "You're a Weekend Spender — 60% of discretionary spend happens Sat/Sun" — generated from patterns |
| **Duplicate Detection** | Flag transactions with the same amount + category within 24 hours as potential duplicates |
| **Natural Language Filter** | Type "show me food expenses over ₹500 last month" — parsed into filter state |
| **Multi-Currency Support** | Toggle between INR / USD / EUR with live exchange rates via a free API (ExchangeRate-API) |

---

<div align="center">

**Built by Vigneshram Venkatesan · Zorvyn Frontend Assessment**

*Angular 17 · TypeScript 5.2 · Chart.js 4 · RxJS 7.8 · Deployed on Vercel*

</div>
