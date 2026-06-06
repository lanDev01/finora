import { UserService } from '@/core/services/user.service';
import { ToastService } from '@/shared/toast/toast.service';
import { formatPtBrCurrency } from '@/shared/ledger-duplicate';
import { Component, computed, inject, input } from '@angular/core';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import { Modal } from '@/shared/modal/modal';
import { type ModalRef } from '@/shared/modal/modal.service';

export type MonthlyGoalPromptAction = 'keep' | 'change';

@Component({
  selector: 'app-monthly-goal-prompt-modal',
  imports: [Modal, Button],
  template: `
    <app-modal
      title="Meta de gastos"
      subtitle="Novo mês, mesma meta?"
      (closed)="onClose()"
    >
      <p class="prompt-message">
        Sua meta de gastos para <strong>{{ monthLabel() }}</strong> é
        <strong>{{ formattedGoal() }}</strong>. Deseja manter ou alterar?
      </p>

      <div class="form-actions">
        <app-button type="button" variant="ghost" [disabled]="saving" (clicked)="onKeep()">
          Manter meta
        </app-button>
        <app-button type="button" [disabled]="saving" (clicked)="onChange()">
          Alterar meta
        </app-button>
      </div>
    </app-modal>
  `,
  styles: `
    .prompt-message {
      margin: 0 0 var(--spacing-lg);
      font-size: var(--font-size-base);
      line-height: 1.55;
      color: var(--foreground-muted);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border);
    }
  `,
  providers: [{ provide: BUTTON_CONFIG, useValue: { size: 'md', variant: 'primary' } }],
})
export class MonthlyGoalPromptModal {
  private userService = inject(UserService);
  private toast = inject(ToastService);

  __modalRef!: ModalRef<MonthlyGoalPromptAction | undefined>;

  goalAmount = input.required<number>();
  monthLabel = input.required<string>();

  saving = false;

  readonly formattedGoal = computed(() => formatPtBrCurrency(this.goalAmount()));

  onKeep(): void {
    if (this.saving) return;
    this.saving = true;
    this.userService.confirmExpenseGoalMonth().subscribe({
      next: () => {
        this.__modalRef.close('keep');
      },
      error: () => {
        this.toast.error('Não foi possível confirmar a meta. Tente novamente.');
        this.saving = false;
      },
    });
  }

  onChange(): void {
    this.__modalRef.close('change');
  }

  onClose(): void {
    this.__modalRef.close(undefined);
  }
}
