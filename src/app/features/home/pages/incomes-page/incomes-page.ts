import { type Income, IncomeService } from '@/core/services/income.service';
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
import { IncomesModal } from '../../../incomes/incomes-modal';

@Component({
  selector: 'app-incomes-page',
  imports: [Header, RouterLink, Button, Table],
  templateUrl: './incomes-page.html',
  styleUrl: './incomes-page.scss',
  providers: [{ provide: BUTTON_CONFIG, useValue: { size: 'md', variant: 'primary' } }],
})
export class IncomesPage implements OnInit {
  private modalService = inject(ModalService);
  private incomeService = inject(IncomeService);

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

  readonly ledgerRowActions: TableRowAction[] = DEFAULT_TABLE_ROW_ACTIONS;

  ngOnInit(): void {
    this.getAllIncomes();
  }

  getAllIncomes(): void {
    this.incomesLoading.set(true);
    const now = new Date();
    this.incomeService.findAll({ month: now.getMonth() + 1, year: now.getFullYear() }).subscribe({
      next: (data) => {
        this.incomes.set(data);
        this.incomesLoading.set(false);
      },
      error: () => this.incomesLoading.set(false),
    });
  }

  openNewIncomeModal(): void {
    const ref = this.modalService.open(IncomesModal);
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.getAllIncomes();
    });
  }

  openEditIncomeModal(row: Record<string, unknown>): void {
    const id = row['id'] as string;
    const income = this.incomes().find((i) => i.id === id);
    if (!income) return;

    const ref = this.modalService.open(IncomesModal, { income });
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.getAllIncomes();
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

  private deleteIncome(row: Record<string, unknown>): void {
    const id = row['id'] as string;
    this.incomeService.remove(id).subscribe({
      next: () => this.getAllIncomes(),
    });
  }

  get currentMonthLabel(): string {
    return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }
}
