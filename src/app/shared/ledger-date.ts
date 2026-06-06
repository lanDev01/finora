/** Datas de lançamento são armazenadas como meia-noite UTC (ex.: 2026-06-06T00:00:00.000Z). */
export const LEDGER_DATE_PIPE_TIMEZONE = 'UTC';

/** Data local de hoje no formato YYYY-MM-DD (input type="date"). */
export function todayDateInputValue(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Extrai YYYY-MM-DD de ISO retornado pela API, sem conversão de fuso. */
export function toDateInputValue(isoDate: string): string {
  const slice = isoDate.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(slice)) return slice;
  try {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return todayDateInputValue();
    return parsed.toISOString().slice(0, 10);
  } catch {
    return todayDateInputValue();
  }
}
