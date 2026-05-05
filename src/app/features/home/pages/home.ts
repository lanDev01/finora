import { SummaryCard, type SummaryCardData } from '@/components/summary-card/summary-card';
import { AnalyticsService, type DashboardSummary } from '@/core/services/analytics.service';
import { type Expense, ExpenseService } from '@/core/services/expense.service';
import { type Income, IncomeService } from '@/core/services/income.service';
import { Header } from '@/layout/header/header';
import { AsyncPipe } from '@angular/common';
import { Component, inject, type OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonDropdown } from '@ui/button-dropdown/button-dropdown';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-angular';
import { map, type Observable } from 'rxjs';
import { type User, UserService } from '../../../core/services/user.service';
import { ModalService } from '../../../shared/modal/modal.service';
import { ExpenseModal } from '../../expenses/expense-modal';
import { IncomesModal } from '../../incomes/incomes-modal';
import { LatestLedgerPanel } from '../components/latest-ledger-panel/latest-ledger-panel';

@Component({
  selector: 'app-home',
  imports: [Header, ButtonDropdown, SummaryCard, AsyncPipe, LatestLedgerPanel],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  providers: [{ provide: BUTTON_CONFIG, useValue: { size: 'md', variant: 'primary' } }],
})
export class Home implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private modalService = inject(ModalService);
  private expenseService = inject(ExpenseService);
  private incomeService = inject(IncomeService);
  private analyticsService = inject(AnalyticsService);

  private readonly brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  readonly user$: Observable<User | null> = this.userService.user$;

  readonly userName$: Observable<string> = this.user$.pipe(map((user) => user?.name ?? 'Usuário'));

  incomes = signal<Income[]>([]);
  incomesLoading = signal(true);

  expenses = signal<Expense[]>([]);
  expensesLoading = signal(true);

  cards = signal<SummaryCardData[]>(this.dashboardToCardsPlaceholder());

  ngOnInit(): void {
    if (!this.userService.currentUser()) {
      const token = localStorage.getItem('access_token');

      if (!token) {
        this.router.navigate(['/auth/sign-in']);
        return;
      }

      this.userService.loadProfile().subscribe({
        error: () => {
          localStorage.removeItem('access_token');
          this.router.navigate(['/auth/sign-in']);
        },
      });
    }

    this.getAllIncomes();
    this.getAllExpenses();
    this.loadDashboard();
  }

  private formatPct(n: number): string {
    const sign = n >= 0 ? '+' : '';
    return `${sign}${n.toFixed(1)}%`;
  }

  private dashboardToCards(d: DashboardSummary): SummaryCardData[] {
    const balanceType: SummaryCardData['type'] = d.balance >= 0 ? 'positive' : 'negative';
    return [
      {
        title: 'Receitas',
        value: this.brl.format(d.incomeTotal),
        icon: TrendingUp,
        change: this.formatPct(d.incomePercentChange),
        type: 'positive',
      },
      {
        title: 'Despesas',
        value: this.brl.format(d.expenseTotal),
        icon: TrendingDown,
        change: this.formatPct(d.expensePercentChange),
        type: 'negative',
      },
      {
        title: 'Saldo',
        value: this.brl.format(d.balance),
        icon: Wallet,
        change: this.formatPct(d.balancePercentChange),
        type: balanceType,
        highlight: true,
      },
    ];
  }

  /** Placeholder até o GET /analytics/dashboard responder */
  private dashboardToCardsPlaceholder(): SummaryCardData[] {
    const dash = '—';
    return [
      {
        title: 'Receitas',
        value: dash,
        icon: TrendingUp,
        change: dash,
        type: 'neutral',
      },
      {
        title: 'Despesas',
        value: dash,
        icon: TrendingDown,
        change: dash,
        type: 'neutral',
      },
      {
        title: 'Saldo',
        value: dash,
        icon: Wallet,
        change: dash,
        type: 'neutral',
        highlight: true,
      },
    ];
  }

  loadDashboard(): void {
    const now = new Date();
    this.analyticsService.getDashboard({ month: now.getMonth() + 1, year: now.getFullYear() }).subscribe({
      next: (d) => this.cards.set(this.dashboardToCards(d)),
      error: () => {
        /* mantém placeholder em falha */
      },
    });
  }

  getAllIncomes(): void {
    const now = new Date();
    this.incomeService.findAll({ month: now.getMonth() + 1, year: now.getFullYear() }).subscribe({
      next: (data) => {
        this.incomes.set(data);
        this.incomesLoading.set(false);
      },
      error: () => this.incomesLoading.set(false),
    });
  }

  getAllExpenses(): void {
    const now = new Date();
    this.expenseService.findAll({ month: now.getMonth() + 1, year: now.getFullYear() }).subscribe({
      next: (data) => {
        this.expenses.set(data);
        this.expensesLoading.set(false);
      },
      error: () => this.expensesLoading.set(false),
    });
  }

  openNewIncomeModal(): void {
    const ref = this.modalService.open(IncomesModal);
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.getAllIncomes();
        this.loadDashboard();
      }
    });
  }

  openNewExpenseModal(): void {
    const ref = this.modalService.open(ExpenseModal);
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.getAllExpenses();
        this.loadDashboard();
      }
    });
  }

  onViewAllLedger(which: 'incomes' | 'expenses'): void {
    const path = which === 'incomes' ? ['/home', 'receitas'] : ['/home', 'despesas'];
    void this.router.navigate(path);
  }
}
