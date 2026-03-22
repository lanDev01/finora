import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

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

@Component({
  selector: 'app-table',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class Table {
  columns = input.required<TableColumn[]>();
  rows = input<Record<string, unknown>[]>([]);
  loading = input<boolean>(false);
  emptyMessage = input<string>('Nenhum registro encontrado.');

  rowClick = output<Record<string, unknown>>();
  deleteClick = output<Record<string, unknown>>();

  trackByIndex(index: number): number {
    return index;
  }

  getCellValue(row: Record<string, unknown>, col: TableColumn): unknown {
    const val = row[col.field];
    if (col.isBadge && val !== null && typeof val === 'object' && 'name' in val) {
      return (val as Record<string, unknown>)['name'];
    }
    return val;
  }
}
