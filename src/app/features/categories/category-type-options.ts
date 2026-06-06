export type CategoryType = 'EXPENSE' | 'INCOME';

export const CATEGORY_TYPE_OPTIONS: { value: CategoryType; label: string }[] = [
  { value: 'EXPENSE', label: 'Despesa' },
  { value: 'INCOME', label: 'Receita' },
];

export function categoryTypeLabel(type: CategoryType): string {
  return CATEGORY_TYPE_OPTIONS.find((opt) => opt.value === type)?.label ?? type;
}
