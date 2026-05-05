import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import { INPUT_CONFIG } from '@ui/input/input.token';
import { Textbox } from '@ui/textbox/textbox';
import { CategoryService, type Category } from '../../core/services/category.service';
import { ToastService } from '@/shared/toast/toast.service';
import { Modal } from '../../shared/modal/modal';
import { type ModalRef } from '../../shared/modal/modal.service';
import { CATEGORY_ICON_OPTIONS, type CategoryIconSlug } from './category-icon-options';

const PRESET_COLORS = [
  '#f97316',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
  '#6366f1',
  '#3b82f6',
  '#06b6d4',
  '#14b8a6',
  '#22c55e',
  '#eab308',
  '#f59e0b',
  '#78716c',
];

@Component({
  selector: 'app-create-category-modal',
  imports: [Modal, ReactiveFormsModule, Textbox, Button, LucideAngularModule],
  template: `
    <app-modal
      title="Nova categoria"
      subtitle="Crie uma categoria para organizar suas despesas"
      (closed)="onClose()"
    >
      <form class="category-modal-form" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group form-group--name">
          <app-textbox
            label="Nome da categoria"
            placeholder="Ex: Alimentação"
            formControlName="name"
          />
        </div>

        <div class="category-modal-pickers" role="region" aria-label="Cor e ícone">
          <div class="form-group form-group--compact">
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

          <div class="form-group form-group--compact">
            <label class="field-label">Ícone</label>
            <div class="icon-grid" role="group" aria-label="Ícone da categoria">
              @for (opt of iconOptions; track opt.slug) {
                <button
                  type="button"
                  class="icon-swatch"
                  [class.selected]="form.get('icon')?.value === opt.slug"
                  (click)="selectIcon(opt.slug)"
                  [attr.aria-label]="opt.label"
                  [attr.aria-pressed]="form.get('icon')?.value === opt.slug"
                >
                  <lucide-icon [name]="opt.icon" size="20" aria-hidden="true" />
                </button>
              }
            </div>
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
    :host ::ng-deep .modal-container {
      width: 100%;
      max-width: 400px;
      max-height: min(520px, 88vh);
      overflow-x: hidden;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    :host ::ng-deep .modal-header {
      flex-shrink: 0;
    }

    :host ::ng-deep .modal-body {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding-top: var(--spacing-md);
    }

    .category-modal-form {
      display: flex;
      flex-direction: column;
      min-height: 0;
      flex: 1;
    }

    .form-group {
      margin-bottom: var(--spacing-lg);
    }

    .form-group--name {
      flex-shrink: 0;
      margin-bottom: var(--spacing-md);
    }

    .form-group--compact {
      margin-bottom: var(--spacing-md);
    }

    .form-group--compact:last-child {
      margin-bottom: 0;
    }

    .category-modal-pickers {
      flex: 1;
      min-height: 0;
      max-height: clamp(140px, 32vh, 260px);
      overflow-y: auto;
      overflow-x: hidden;
      padding: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--muted);
      scrollbar-gutter: stable;
    }

    .category-modal-pickers::-webkit-scrollbar {
      width: 6px;
    }

    .category-modal-pickers::-webkit-scrollbar-track {
      background: transparent;
    }

    .category-modal-pickers::-webkit-scrollbar-thumb {
      background-color: var(--foreground-subtle);
      border-radius: var(--radius-full);
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

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: var(--spacing-sm);
    }

    .icon-swatch {
      width: 100%;
      aspect-ratio: 1;
      border-radius: var(--radius-md);
      border: 2px solid var(--border);
      background: var(--muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--foreground);
      transition:
        border-color var(--transition-fast),
        transform var(--transition-fast),
        background-color var(--transition-fast);

      &:hover {
        transform: scale(1.06);
        background: var(--background);
      }

      &.selected {
        border-color: var(--foreground);
        background: var(--background);
        transform: scale(1.06);
      }
    }

    .form-actions {
      flex-shrink: 0;
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
      margin-top: 0;
      padding-top: var(--spacing-md);
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
  private toast = inject(ToastService);

  /** Injected by ModalService */
  __modalRef!: ModalRef<Category | undefined>;

  readonly presetColors = PRESET_COLORS;
  readonly iconOptions = CATEGORY_ICON_OPTIONS;

  saving = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    color: [PRESET_COLORS[0]],
    icon: ['tag' satisfies CategoryIconSlug],
  });

  selectColor(color: string): void {
    this.form.patchValue({ color });
  }

  selectIcon(slug: CategoryIconSlug): void {
    this.form.patchValue({ icon: slug });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;

    this.saving = true;
    const { name, color, icon } = this.form.getRawValue();

    this.categoryService
      .create({
        name: name!,
        color: color ?? undefined,
        icon: (icon ?? 'tag') as CategoryIconSlug,
      })
      .subscribe({
        next: (category) => {
          this.toast.success('Categoria criada com sucesso!');
          this.__modalRef.close(category);
        },
        error: () => {
          this.toast.error('Não foi possível criar a categoria. Tente novamente.');
          this.saving = false;
        },
      });
  }

  onClose(): void {
    this.__modalRef.close(undefined);
  }
}
