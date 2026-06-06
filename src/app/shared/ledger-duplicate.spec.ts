import { toDateInputValue, todayDateInputValue as localToday } from './ledger-date';
import {
  formatPtBrCurrency,
  ledgerAmountToNumber,
  toDuplicateFormValues,
} from './ledger-duplicate';

describe('ledger-date', () => {
  it('todayDateInputValue uses local calendar date', () => {
    const fixedNow = new Date(2026, 5, 6, 23, 30, 0);
    expect(localToday(fixedNow)).toBe('2026-06-06');
  });

  it('toDateInputValue extracts calendar date from UTC ISO', () => {
    expect(toDateInputValue('2026-06-06T00:00:00.000Z')).toBe('2026-06-06');
  });
});

describe('ledger-duplicate', () => {
  describe('toDuplicateFormValues', () => {
    const fixedNow = new Date(2026, 5, 6, 15, 0, 0);

    it('copies description and notes', () => {
      const result = toDuplicateFormValues(
        {
          description: 'Academia',
          amount: 99.9,
          categoryId: 'cat-1',
          notes: 'Mensal',
        },
        ['cat-1'],
        fixedNow,
      );

      expect(result.description).toBe('Academia');
      expect(result.notes).toBe('Mensal');
    });

    it('formats amount in pt-BR', () => {
      const result = toDuplicateFormValues(
        { description: 'X', amount: 99.9, categoryId: 'cat-1' },
        ['cat-1'],
        fixedNow,
      );

      expect(result.amount).toBe(formatPtBrCurrency(99.9));
    });

    it('sets date to today', () => {
      const result = toDuplicateFormValues(
        { description: 'X', amount: 10, categoryId: 'cat-1' },
        ['cat-1'],
        fixedNow,
      );

      expect(result.date).toBe(localToday(fixedNow));
    });

    it('keeps categoryId when available', () => {
      const result = toDuplicateFormValues(
        { description: 'X', amount: 10, categoryId: 'cat-1' },
        ['cat-1', 'cat-2'],
        fixedNow,
      );

      expect(result.categoryId).toBe('cat-1');
    });

    it('clears categoryId when not available', () => {
      const result = toDuplicateFormValues(
        { description: 'X', amount: 10, categoryId: 'removed' },
        ['cat-1'],
        fixedNow,
      );

      expect(result.categoryId).toBe('');
    });

    it('normalizes undefined notes to empty string', () => {
      const result = toDuplicateFormValues(
        { description: 'X', amount: 10, categoryId: 'cat-1' },
        ['cat-1'],
        fixedNow,
      );

      expect(result.notes).toBe('');
    });
  });

  describe('ledgerAmountToNumber', () => {
    it('parses numeric strings', () => {
      expect(ledgerAmountToNumber('99,90')).toBe(99.9);
    });
  });
});
