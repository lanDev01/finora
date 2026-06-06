import { todayDateInputValue } from '@/shared/ledger-date';
import { parseAmountField } from '@/shared/parse-amount-field';

export interface LedgerDuplicateSource {
  description: string;
  amount: unknown;
  categoryId: string;
  notes?: string;
}

export interface LedgerDuplicateFormValues {
  description: string;
  amount: string;
  date: string;
  categoryId: string;
  notes: string;
}

export function ledgerAmountToNumber(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const n = parseAmountField(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function formatPtBrCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function toDuplicateFormValues(
  source: LedgerDuplicateSource,
  availableCategoryIds: Iterable<string>,
  now: Date = new Date(),
): LedgerDuplicateFormValues {
  const ids = new Set(availableCategoryIds);
  const amountNum = ledgerAmountToNumber(source.amount);

  return {
    description: source.description,
    amount: formatPtBrCurrency(amountNum),
    date: todayDateInputValue(now),
    categoryId: ids.has(source.categoryId) ? source.categoryId : '',
    notes: source.notes ?? '',
  };
}
