import { computeGoalProgress } from '@/shared/expense-goal';
import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-spending-goal-progress',
  imports: [CurrencyPipe],
  templateUrl: './spending-goal-progress.html',
  styleUrl: './spending-goal-progress.scss',
})
export class SpendingGoalProgress {
  goal = input<number | null>(null);
  spent = input(0);
  monthLabel = input('');
  loading = input(false);

  defineGoal = output<void>();

  readonly hasGoal = computed(() => {
    const g = this.goal();
    return g != null && g > 0;
  });

  readonly progress = computed(() => {
    const g = this.goal();
    if (g == null || g <= 0) return null;
    return computeGoalProgress(this.spent(), g);
  });
}
