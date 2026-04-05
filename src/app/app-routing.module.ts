import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BudgetComponent } from './components/budget/budget.component';
import { InsightsComponent } from './components/insights/insights.component';
import { TransactionsComponent } from './components/transactions/transactions.component';

const routes: Routes = [
  { path: '',             redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',    component: DashboardComponent   },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'insights',     component: InsightsComponent    },
  { path: 'budget',       component: BudgetComponent,
    data: { standalone: true }                             },
  { path: '**',           redirectTo: 'dashboard'         },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
