import {
  formatPtBrCurrency,
  ledgerAmountToNumber,
  toDuplicateFormValues,
  todayDateInputValue,
} from './ledger-duplicate';

describe('ledger-duplicate', () => {
  describe('toDuplicateFormValues', () => {
    const fixedNow = new Date('2026-06-06T15:00:00.000Z');

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

      expect(result.date).toBe(todayDateInputValue(fixedNow));
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
