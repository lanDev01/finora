import { type User, UserService } from '@/core/services/user.service';
import { ToastService } from '@/shared/toast/toast.service';
import { parseAmountField } from '@/shared/parse-amount-field';
import { ledgerAmountToNumber, formatPtBrCurrency } from '@/shared/ledger-duplicate';
import { Component, computed, inject, input, type OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import { INPUT_CONFIG } from '@ui/input/input.token';
import { Textbox } from '@ui/textbox/textbox';
import { Modal } from '@/shared/modal/modal';
import { type ModalRef } from '@/shared/modal/modal.service';

@Component({
  selector: 'app-spending-goal-modal',
  imports: [Modal, ReactiveFormsModule, Textbox, Button],
  template: `
    <app-modal
      [title]="headerTitle()"
      subtitle="Defina quanto deseja gastar por mês"
      (closed)="onClose()"
    >
      <form class="goal-form" [formGroup]="form" (ngSubmit)="onSubmit()">
        <app-textbox
          label="Meta mensal (R$)"
          placeholder="0,00"
          formControlName="amount"
          mask="currency"
        />

        <div class="form-actions">
          @if (hasExistingGoal()) {
            <app-button type="button" variant="ghost" class="remove-btn" (clicked)="onRemove()">
              Remover meta
            </app-button>
          }
          <div class="form-actions-main">
            <app-button type="button" variant="ghost" (clicked)="onClose()">Cancelar</app-button>
            <app-button type="submit" [disabled]="form.invalid || saving">
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </app-button>
          </div>
        </div>
      </form>
    </app-modal>
  `,
  styles: `
    .goal-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .form-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-sm);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border);
    }

    .form-actions-main {
      display: flex;
      gap: var(--spacing-sm);
      margin-left: auto;
    }

    :host ::ng-deep .remove-btn {
      color: var(--destructive);
    }
  `,
  providers: [
    { provide: BUTTON_CONFIG, useValue: { size: 'md', variant: 'primary' } },
    { provide: INPUT_CONFIG, useValue: { size: 'md', variant: 'default' } },
  ],
})
export class SpendingGoalModal implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toast = inject(ToastService);

  __modalRef!: ModalRef<User | undefined>;

  currentGoal = input<number | null>(null);

  saving = false;

  readonly headerTitle = computed(() =>
    this.hasExistingGoal() ? 'Editar meta de gastos' : 'Meta de gastos',
  );

  readonly hasExistingGoal = computed(() => {
    const g = this.currentGoal();
    return g != null && g > 0;
  });

  form = this.fb.group({
    amount: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const goal = this.currentGoal();
    if (goal != null && goal > 0) {
      this.form.patchValue({ amount: formatPtBrCurrency(ledgerAmountToNumber(goal)) });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;

    const amount = parseAmountField(this.form.getRawValue().amount);
    if (!Number.isFinite(amount) || amount <= 0) return;

    this.saving = true;
    this.userService.updateExpenseGoal(amount).subscribe({
      next: (user) => {
        this.toast.success('Meta de gastos salva com sucesso!');
        this.__modalRef.close(user);
      },
      error: () => {
        this.toast.error('Não foi possível salvar a meta. Tente novamente.');
        this.saving = false;
      },
    });
  }

  onRemove(): void {
    if (this.saving) return;
    this.saving = true;
    this.userService.updateExpenseGoal(null).subscribe({
      next: (user) => {
        this.toast.success('Meta de gastos removida.');
        this.__modalRef.close(user);
      },
      error: () => {
        this.toast.error('Não foi possível remover a meta. Tente novamente.');
        this.saving = false;
      },
    });
  }

  onClose(): void {
    this.__modalRef.close(undefined);
  }
}
