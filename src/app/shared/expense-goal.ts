export interface ExpenseGoalProgress {
  percent: number;
  remaining: number;
  exceeded: number;
  isOver: boolean;
  label: string;
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function currentMonthKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function currentMonthLabel(date: Date = new Date()): string {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function computeGoalProgress(spent: number, goal: number): ExpenseGoalProgress {
  const safeGoal = goal > 0 ? goal : 0;
  const safeSpent = spent >= 0 ? spent : 0;
  const isOver = safeSpent > safeGoal;
  const remaining = Math.max(safeGoal - safeSpent, 0);
  const exceeded = Math.max(safeSpent - safeGoal, 0);
  const percent = safeGoal > 0 ? Math.min((safeSpent / safeGoal) * 100, 100) : 0;

  const label = isOver
    ? `Meta ultrapassada em ${brl.format(exceeded)}`
    : `Faltam ${brl.format(remaining)} para a meta`;

  return { percent, remaining, exceeded, isOver, label };
}

export function shouldShowMonthlyGoalPrompt(
  goal: number | null | undefined,
  confirmedMonth: string | null | undefined,
  now: Date = new Date(),
): boolean {
  return goal != null && goal > 0 && confirmedMonth !== currentMonthKey(now);
}
