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

export function todayDateInputValue(now: Date = new Date()): string {
  return now.toISOString().split('T')[0];
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

export function toDateInputValue(isoDate: string): string {
  const slice = isoDate.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(slice)) return slice;
  try {
    return new Date(isoDate).toISOString().split('T')[0];
  } catch {
    return todayDateInputValue();
  }
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
