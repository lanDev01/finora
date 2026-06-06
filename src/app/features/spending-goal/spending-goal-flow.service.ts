import { Injectable, inject } from '@angular/core';
import { type User, UserService } from '@/core/services/user.service';
import { ModalService, type ModalRef } from '@/shared/modal/modal.service';
import { MonthlyGoalPromptModal } from '@/features/spending-goal/monthly-goal-prompt-modal';
import { SpendingGoalModal } from '@/features/spending-goal/spending-goal-modal';
import { currentMonthLabel, shouldShowMonthlyGoalPrompt } from '@/shared/expense-goal';

@Injectable({ providedIn: 'root' })
export class SpendingGoalFlowService {
  private modalService = inject(ModalService);
  private userService = inject(UserService);

  openSpendingGoalModal(currentGoal?: number | null): ModalRef<User | undefined> {
    const goal = currentGoal ?? this.userService.currentUser()?.monthlyExpenseGoal ?? null;
    return this.modalService.open(SpendingGoalModal, { currentGoal: goal });
  }

  maybeShowMonthlyPrompt(onComplete?: () => void): void {
    const user = this.userService.currentUser();
    if (!user) return;

    if (
      !shouldShowMonthlyGoalPrompt(user.monthlyExpenseGoal, user.expenseGoalConfirmedMonth)
    ) {
      return;
    }

    const ref = this.modalService.open(MonthlyGoalPromptModal, {
      goalAmount: user.monthlyExpenseGoal!,
      monthLabel: currentMonthLabel(),
    });

    ref.afterClosed().subscribe((action) => {
      if (action === 'change') {
        this.openSpendingGoalModal(user.monthlyExpenseGoal).afterClosed().subscribe(() => {
          onComplete?.();
        });
        return;
      }
      onComplete?.();
    });
  }
}
