import { type Expense, ExpenseService } from '@/core/services/expense.service';
import { Header } from '@/layout/header/header';
import { ModalService } from '@/shared/modal/modal.service';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import {
  DEFAULT_TABLE_ROW_ACTIONS,
  Table,
  type TableColumn,
  type TableRowAction,
} from '@ui/table/table';
import { Component, inject, type OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExpenseModal } from '../../../expenses/expense-modal';

@Component({
  selector: 'app-expenses-page',
  imports: [Header, RouterLink, Button, Table],
  templateUrl: './expenses-page.html',
  styleUrl: './expenses-page.scss',
  providers: [{ provide: BUTTON_CONFIG, useValue: { size: 'md', variant: 'primary' } }],
})
export class ExpensesPage implements OnInit {
  private modalService = inject(ModalService);
  private expenseService = inject(ExpenseService);

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

  readonly ledgerRowActions: TableRowAction[] = DEFAULT_TABLE_ROW_ACTIONS;

  ngOnInit(): void {
    this.getAllExpenses();
  }

  getAllExpenses(): void {
    this.expensesLoading.set(true);
    const now = new Date();
    this.expenseService.findAll({ month: now.getMonth() + 1, year: now.getFullYear() }).subscribe({
      next: (data) => {
        this.expenses.set(data);
        this.expensesLoading.set(false);
      },
      error: () => this.expensesLoading.set(false),
    });
  }

  openNewExpenseModal(): void {
    const ref = this.modalService.open(ExpenseModal);
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.getAllExpenses();
    });
  }

  openEditExpenseModal(row: Record<string, unknown>): void {
    const id = row['id'] as string;
    const expense = this.expenses().find((e) => e.id === id);
    if (!expense) return;

    const ref = this.modalService.open(ExpenseModal, { expense });
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.getAllExpenses();
    });
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
