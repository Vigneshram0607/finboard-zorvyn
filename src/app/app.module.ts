import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BudgetComponent } from './components/budget/budget.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InsightsComponent } from './components/insights/insights.component';
import { CountUpDirective } from './components/shared/count-up.directive';
import { HighlightPipe } from './components/shared/highlight.pipe';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { SkeletonComponent } from './components/shared/skeleton/skeleton.component';
import { SummaryCardComponent } from './components/shared/summary-card/summary-card.component';
import { SvgIconComponent } from './components/shared/svg-icon.component';
import { ToastComponent } from './components/shared/toast/toast.component';
import { TransactionsComponent } from './components/transactions/transactions.component';





@NgModule({
  declarations: [
    AppComponent,
    SvgIconComponent,
    SummaryCardComponent,
    NavbarComponent,
    ToastComponent,
    SkeletonComponent,
    CountUpDirective,
    HighlightPipe,
    DashboardComponent,
    TransactionsComponent,
    InsightsComponent,
    BudgetComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
