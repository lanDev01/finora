export function defaultLedgerPeriodInput(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function partsFromLedgerPeriod(value: string): { month: number; year: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) };
}

export function ledgerPeriodLabel(value: string): string {
  const parts = partsFromLedgerPeriod(value);
  if (!parts) return '';
  const date = new Date(parts.year, parts.month - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}
