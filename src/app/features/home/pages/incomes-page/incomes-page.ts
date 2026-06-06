import { type Income, IncomeService } from '@/core/services/income.service';
import { Header } from '@/layout/header/header';
import {
  defaultLedgerPeriodInput,
  ledgerPeriodLabel,
  partsFromLedgerPeriod,
} from '@/shared/ledger-period';
import { ModalService } from '@/shared/modal/modal.service';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import {
  LEDGER_TABLE_ROW_ACTIONS,
  Table,
  type TableColumn,
  type TableRowAction,
} from '@ui/table/table';
import { Component, computed, inject, type OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, RefreshCw } from 'lucide-angular';
import { IncomesModal } from '../../../incomes/incomes-modal';

@Component({
  selector: 'app-incomes-page',
  imports: [Header, RouterLink, Button, Table, LucideAngularModule],
  templateUrl: './incomes-page.html',
  styleUrl: './incomes-page.scss',
  providers: [{ provide: BUTTON_CONFIG, useValue: { size: 'md', variant: 'primary' } }],
})
export class IncomesPage implements OnInit {
  private modalService = inject(ModalService);
  private incomeService = inject(IncomeService);

  incomes = signal<Income[]>([]);
  incomesLoading = signal(true);
  periodInput = signal(defaultLedgerPeriodInput());

  readonly periodLabel = computed(() => ledgerPeriodLabel(this.periodInput()));

  incomesRows = (): Record<string, unknown>[] =>
    this.incomes() as unknown as Record<string, unknown>[];

  readonly incomeColumns: TableColumn[] = [
    { field: 'description', header: 'Descrição' },
    { field: 'date', header: 'Data', isDate: true },
    { field: 'amount', header: 'Valor', isCurrency: true },
    { field: 'category', header: 'Categoria', isBadge: true },
  ];

  readonly ledgerRowActions: TableRowAction[] = LEDGER_TABLE_ROW_ACTIONS;
  protected readonly refreshIcon = RefreshCw;

  ngOnInit(): void {
    this.loadIncomes();
  }

  onPeriodChange(value: string): void {
    this.periodInput.set(value);
    this.loadIncomes();
  }

  reloadIncomes(): void {
    this.loadIncomes();
  }

  loadIncomes(): void {
    const parts = partsFromLedgerPeriod(this.periodInput());
    if (!parts) return;

    this.incomesLoading.set(true);
    this.incomeService.findAll({ month: parts.month, year: parts.year }).subscribe({
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
      if (saved) this.loadIncomes();
    });
  }

  openEditIncomeModal(row: Record<string, unknown>): void {
    const id = row['id'] as string;
    const income = this.incomes().find((i) => i.id === id);
    if (!income) return;

    const ref = this.modalService.open(IncomesModal, { income });
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.loadIncomes();
    });
  }

  openDuplicateIncomeModal(row: Record<string, unknown>): void {
    const id = row['id'] as string;
    const income = this.incomes().find((i) => i.id === id);
    if (!income) return;

    const ref = this.modalService.open(IncomesModal, { duplicateFrom: income });
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.loadIncomes();
    });
  }

  onIncomeTableAction(event: { action: string; row: Record<string, unknown> }): void {
    if (event.action === 'delete') {
      this.deleteIncome(event.row);
      return;
    }
    if (event.action === 'duplicate') {
      this.openDuplicateIncomeModal(event.row);
      return;
    }
    if (event.action === 'edit') {
      this.openEditIncomeModal(event.row);
    }
  }

  private deleteIncome(row: Record<string, unknown>): void {
    const id = row['id'] as string;
    this.incomeService.remove(id).subscribe({
      next: () => this.loadIncomes(),
    });
  }
}
