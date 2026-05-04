import { type Expense } from '@/core/services/expense.service';
import { type Income } from '@/core/services/income.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { ArrowRight, Filter, LucideAngularModule, Search } from 'lucide-angular';

const LIST_LIMIT = 5;

function amountToNumber(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') return parseFloat(value.replace(',', '.')) || 0;
  return 0;
}

@Component({
  selector: 'app-latest-ledger-panel',
  imports: [CurrencyPipe, DatePipe, LucideAngularModule],
  templateUrl: './latest-ledger-panel.html',
  styleUrl: './latest-ledger-panel.scss',
})
export class LatestLedgerPanel {
  incomes = input<Income[]>([]);
  expenses = input<Expense[]>([]);
  incomesLoading = input(false);
  expensesLoading = input(false);

  viewAll = output<'incomes' | 'expenses'>();

  protected readonly searchIcon = Search;
  protected readonly filterIcon = Filter;
  protected readonly arrowRightIcon = ArrowRight;

  protected readonly activeTab = signal<'incomes' | 'expenses'>('incomes');
  protected readonly search = signal('');

  protected readonly listTitle = computed(() =>
    this.activeTab() === 'incomes' ? 'Últimas receitas' : 'Últimas despesas',
  );

  protected readonly footerLabel = computed(() =>
    this.activeTab() === 'incomes' ? 'Ver todas as receitas' : 'Ver todas as despesas',
  );

  protected readonly isLoading = computed(() =>
    this.activeTab() === 'incomes' ? this.incomesLoading() : this.expensesLoading(),
  );

  protected readonly displayedIncomes = computed(() => {
    const q = this.search().trim().toLowerCase();
    let list = [...this.incomes()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    if (q) {
      list = list.filter(
        (i) =>
          i.description.toLowerCase().includes(q) ||
          (i.category?.name?.toLowerCase().includes(q) ?? false),
      );
    }
    return list.slice(0, LIST_LIMIT);
  });

  protected readonly displayedExpenses = computed(() => {
    const q = this.search().trim().toLowerCase();
    let list = [...this.expenses()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    if (q) {
      list = list.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          (e.category?.name?.toLowerCase().includes(q) ?? false),
      );
    }
    return list.slice(0, LIST_LIMIT);
  });

  protected setTab(tab: 'incomes' | 'expenses'): void {
    this.activeTab.set(tab);
  }

  protected onSearchInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.search.set(v);
  }

  protected amountNum(value: unknown): number {
    return amountToNumber(value);
  }

  protected emitViewAll(): void {
    this.viewAll.emit(this.activeTab());
  }

  protected categoryInitial(row: Income | Expense): string {
    const icon = row.category?.icon?.trim();
    if (icon && icon.length <= 4) return icon;
    const n = row.category?.name?.trim();
    if (n?.length) return n.charAt(0).toUpperCase();
    return '?';
  }
}
