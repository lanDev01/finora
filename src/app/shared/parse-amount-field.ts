export function parseAmountField(input: string | null | undefined): number {
  if (input == null || !String(input).trim()) return NaN;
  const s = String(input).trim();
  if (s.includes(',')) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.'));
  }
  return parseFloat(s);
}
