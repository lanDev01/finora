/** Chave YYYY-MM → rótulo curto em pt-BR (UTC). */
export function formatMonthKeyLabel(monthKey: string, style: 'short' | 'long' = 'short'): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const date = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, 1));
  return date.toLocaleDateString('pt-BR', {
    month: style,
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function currentUtcMonthYear(now = new Date()): { month: number; year: number } {
  return { month: now.getUTCMonth() + 1, year: now.getUTCFullYear() };
}

export function monthKeyFromParts(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function partsFromMonthInput(value: string): { month: number; year: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) };
}

export function monthInputFromParts(month: number, year: number): string {
  return monthKeyFromParts(month, year);
}

export function previousMonth(month: number, year: number): { month: number; year: number } {
  const d = new Date(Date.UTC(year, month - 2, 1));
  return { month: d.getUTCMonth() + 1, year: d.getUTCFullYear() };
}

export type CompareMode = 'previous' | 'none' | 'custom';

export function formatBrl(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatPctChange(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

export function pctChange(current: number, previous: number): number {
  if (previous <= 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
