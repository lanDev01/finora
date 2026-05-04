import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MoreVertical, LucideAngularModule } from 'lucide-angular';
import { ButtonDropdown } from '../button-dropdown/button-dropdown';
import { BUTTON_CONFIG } from '../button/button.token';

export interface TableColumn {
  /** Chave do objeto */
  field: string;
  /** Cabeçalho exibido */
  header: string;
  /** Formata o valor como moeda (BRL) */
  isCurrency?: boolean;
  /** Formata o valor como data (dd/MM/yyyy) */
  isDate?: boolean;
  /** Renderiza um badge colorido usando a cor da categoria */
  isBadge?: boolean;
}

/** Ação exibida no menu da linha; `danger` destaca estilo destrutivo (ex.: excluir). */
export interface TableRowAction {
  id: string;
  label: string;
  danger?: boolean;
}

export const DEFAULT_TABLE_ROW_ACTIONS: TableRowAction[] = [
  { id: 'edit', label: 'Editar' },
  { id: 'delete', label: 'Excluir', danger: true },
];

@Component({
  selector: 'app-table',
  imports: [CurrencyPipe, DatePipe, ButtonDropdown, LucideAngularModule],
  templateUrl: './table.html',
  styleUrl: './table.scss',
  providers: [{ provide: BUTTON_CONFIG, useValue: { size: 'sm', variant: 'ghost' } }],
})
export class Table {
  columns = input.required<TableColumn[]>();
  rows = input<Record<string, unknown>[]>([]);
  loading = input<boolean>(false);
  emptyMessage = input<string>('Nenhum registro encontrado.');
  rowActions = input<TableRowAction[]>(DEFAULT_TABLE_ROW_ACTIONS);

  rowClick = output<Record<string, unknown>>();
  actionClick = output<{ action: string; row: Record<string, unknown> }>();

  protected readonly moreIcon = MoreVertical;

  trackByIndex(index: number): number {
    return index;
  }

  trackActionId(_index: number, action: TableRowAction): string {
    return action.id;
  }

  protected emitRowAction(actionId: string, row: Record<string, unknown>): void {
    this.actionClick.emit({ action: actionId, row });
  }

  getCellValue(row: Record<string, unknown>, col: TableColumn): unknown {
    const val = row[col.field];
    if (col.isBadge && val !== null && typeof val === 'object' && 'name' in val) {
      return (val as Record<string, unknown>)['name'];
    }
    return val;
  }
}
