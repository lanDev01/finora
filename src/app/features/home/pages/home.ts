import { SummaryCard, type SummaryCardData } from '@/components/summary-card/summary-card';
import { type Expense, ExpenseService } from '@/core/services/expense.service';
import { type Income, IncomeService } from '@/core/services/income.service';
import { Header } from '@/layout/header/header';
import { AsyncPipe } from '@angular/common';
import { Component, inject, type OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonDropdown } from '@ui/button-dropdown/button-dropdown';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import {
  DEFAULT_TABLE_ROW_ACTIONS,
  Table,
  type TableColumn,
  type TableRowAction,
} from '@ui/table/table';
import { PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-angular';
import { map, type Observable } from 'rxjs';
import { type User, UserService } from '../../../core/services/user.service';
import { ModalService } from '../../../shared/modal/modal.service';
import { ExpenseModal } from '../../expenses/expense-modal';
import { IncomesModal } from '../../incomes/incomes-modal';

@Component({
  selector: 'app-home',
  imports: [Header, ButtonDropdown, SummaryCard, AsyncPipe, Table],
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

  /** Observable com os dados do usuário logado */
  readonly user$: Observable<User | null> = this.userService.user$;

  /** Nome do usuário para exibição (com fallback) */
  readonly userName$: Observable<string> = this.user$.pipe(map((user) => user?.name ?? 'Usuário'));

  incomes = signal<Income[]>([]);
  incomesLoading = signal(true);

  incomesRows = (): Record<string, unknown>[] =>
    this.incomes() as unknown as Record<string, unknown>[];

  readonly incomeColumns: TableColumn[] = [
    { field: 'description', header: 'Descrição' },
    { field: 'date', header: 'Data', isDate: true },
    { field: 'amount', header: 'Valor', isCurrency: true },
    { field: 'category', header: 'Categoria', isBadge: true },
  ];

  expenses = signal<Expense[]>([]);
  expensesLoading = signal(true);

  expensesRows = (): Record<string, unknown>[] =>
    this.expenses() as unknown as Record<string, unknown>[];

  readonly expenseColumns: TableColumn[] = [
    { field: 'description', header: 'Descrição' },
    { field: 'date', header: 'Data', isDate: true },
    { field: 'amount', header: 'Valor', isCurrency: true },
    { field: 'category', header: 'Categoria', isBadge: true },
  ];

  /** Menu da coluna de ações nas tabelas de receitas/despesas (pode estender além do padrão). */
  readonly ledgerRowActions: TableRowAction[] = DEFAULT_TABLE_ROW_ACTIONS;

  cards: SummaryCardData[] = [
    {
      title: 'Saldo Total',
      value: 'R$ 12.450,00',
      icon: Wallet,
      change: '+12.5%',
      type: 'positive',
      highlight: true,
    },
    {
      title: 'Receitas',
      value: 'R$ 18.200,00',
      icon: TrendingUp,
      change: '+8.2%',
      type: 'positive',
    },
    {
      title: 'Despesas',
      value: 'R$ 5.750,00',
      icon: TrendingDown,
      change: '-3.1%',
      type: 'negative',
    },
    {
      title: 'Economia',
      value: 'R$ 6.450,00',
      icon: PiggyBank,
      change: '+15.7%',
      type: 'positive',
    },
  ];

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
      }
    });
  }

  openNewExpenseModal(): void {
    const ref = this.modalService.open(ExpenseModal);
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.getAllExpenses();
      }
    });
  }

  openEditIncomeModal(row: Record<string, unknown>): void {
    const id = row['id'] as string;
    const income = this.incomes().find((i) => i.id === id);
    if (!income) return;

    const ref = this.modalService.open(IncomesModal, { income });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.getAllIncomes();
      }
    });
  }

  openEditExpenseModal(row: Record<string, unknown>): void {
    const id = row['id'] as string;
    const expense = this.expenses().find((e) => e.id === id);
    if (!expense) return;

    const ref = this.modalService.open(ExpenseModal, { expense });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        this.getAllExpenses();
      }
    });
  }

  onIncomeTableAction(event: { action: string; row: Record<string, unknown> }): void {
    if (event.action === 'delete') {
      this.deleteIncome(event.row);
      return;
    }
    if (event.action === 'edit') {
      this.openEditIncomeModal(event.row);
    }
  }

  onExpenseTableAction(event: { action: string; row: Record<string, unknown> }): void {
    if (event.action === 'delete') {
      this.deleteExpense(event.row);
      return;
    }
    if (event.action === 'edit') {
      this.openEditExpenseModal(event.row);
    }
  }

  private deleteIncome(row: Record<string, unknown>): void {
    const id = row['id'] as string;

    this.incomeService.remove(id).subscribe({
      next: () => this.getAllIncomes(),
    });
  }

  private deleteExpense(row: Record<string, unknown>): void {
    const id = row['id'] as string;

    this.expenseService.remove(id).subscribe({
      next: () => this.getAllExpenses(),
    });
  }

  get currentMonthLabel(): string {
    return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }
}
