import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import { INPUT_CONFIG } from '@ui/input/input.token';
import { Textbox } from '@ui/textbox/textbox';
import { Modal } from '../../shared/modal/modal';
import { type ModalRef } from '../../shared/modal/modal.service';
import { CategoryService, type Category } from '../../core/services/category.service';

const PRESET_COLORS = [
  '#f97316', '#ef4444', '#ec4899', '#8b5cf6',
  '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6',
  '#22c55e', '#eab308', '#f59e0b', '#78716c',
];

@Component({
  selector: 'app-create-category-modal',
  imports: [Modal, ReactiveFormsModule, Textbox, Button],
  template: `
    <app-modal title="Nova categoria" subtitle="Crie uma categoria para organizar suas despesas" (closed)="onClose()">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <app-textbox label="Nome da categoria" placeholder="Ex: Alimentação" formControlName="name" />
        </div>

        <div class="form-group">
          <label class="field-label">Cor</label>
          <div class="color-grid">
            @for (color of presetColors; track color) {
              <button
                type="button"
                class="color-swatch"
                [class.selected]="form.get('color')?.value === color"
                [style.background-color]="color"
                (click)="selectColor(color)"
                [attr.aria-label]="'Selecionar cor ' + color"
              >
                @if (form.get('color')?.value === color) {
                  <span class="check-icon">✓</span>
                }
              </button>
            }
          </div>
        </div>

        <div class="form-actions">
          <app-button type="button" variant="ghost" (clicked)="onClose()">Cancelar</app-button>
          <app-button type="submit" [disabled]="form.invalid || saving">
            {{ saving ? 'Salvando...' : 'Criar categoria' }}
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: `
    .form-group {
      margin-bottom: var(--spacing-lg);
    }

    .field-label {
      display: block;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--foreground);
      margin-bottom: var(--spacing-sm);
    }

    .color-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: var(--spacing-sm);
    }

    .color-swatch {
      width: 100%;
      aspect-ratio: 1;
      border-radius: var(--radius-md);
      border: 2px solid transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        border-color var(--transition-fast),
        transform var(--transition-fast);

      &:hover {
        transform: scale(1.1);
      }

      &.selected {
        border-color: var(--foreground);
        transform: scale(1.1);
      }
    }

    .check-icon {
      color: white;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-lg);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--border);
    }
  `,
  providers: [
    { provide: BUTTON_CONFIG, useValue: { size: 'md', variant: 'primary' } },
    { provide: INPUT_CONFIG, useValue: { size: 'md', variant: 'default' } },
  ],
})
export class CreateCategoryModal {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);

  /** Injected by ModalService */
  __modalRef!: ModalRef<Category | undefined>;

  readonly presetColors = PRESET_COLORS;

  saving = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    color: [PRESET_COLORS[0]],
  });

  selectColor(color: string): void {
    this.form.patchValue({ color });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;

    this.saving = true;
    const { name, color } = this.form.getRawValue();

    this.categoryService.create({ name: name!, color: color ?? undefined }).subscribe({
      next: (category) => {
        this.__modalRef.close(category);
      },
      error: () => {
        this.saving = false;
      },
    });
  }

  onClose(): void {
    this.__modalRef.close(undefined);
  }
}
