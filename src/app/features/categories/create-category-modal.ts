import { Component, computed, inject, input, type OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import { INPUT_CONFIG } from '@ui/input/input.token';
import { Textbox } from '@ui/textbox/textbox';
import {
  CategoryService,
  type Category,
  type CategoryType,
} from '../../core/services/category.service';
import { ToastService } from '@/shared/toast/toast.service';
import { Modal } from '../../shared/modal/modal';
import { type ModalRef } from '../../shared/modal/modal.service';
import { CATEGORY_ICON_OPTIONS, type CategoryIconSlug } from './category-icon-options';
import { CATEGORY_TYPE_OPTIONS } from './category-type-options';

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
      [title]="headerTitle()"
      [subtitle]="headerSubtitle()"
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

        <div class="form-group form-group--type">
          <label class="field-label" for="category-type-select">Tipo</label>
          <select id="category-type-select" class="type-select" formControlName="type">
            @for (opt of typeOptions; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
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
            {{ submitLabel() }}
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: `
    :host ::ng-deep .modal-container {
      width: 100%;
      max-width: 400px;
      max-height: min(560px, 88vh);
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

    .form-group--name,
    .form-group--type {
      flex-shrink: 0;
      margin-bottom: var(--spacing-md);
    }

    .form-group--compact {
      margin-bottom: var(--spacing-md);
    }

    .form-group--compact:last-child {
      margin-bottom: 0;
    }

    .field-label {
      display: block;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--foreground);
      margin-bottom: var(--spacing-sm);
    }

    .type-select {
      width: 100%;
      padding: 0.5rem 0.75rem;
      font-family: inherit;
      font-size: var(--font-size-base);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background-color: var(--background-subtle);
      color: var(--foreground);
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;

      &:focus {
        border-color: var(--input-focus);
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 20%, transparent);
      }
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
export class CreateCategoryModal implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);

  /** Injected by ModalService */
  __modalRef!: ModalRef<Category | undefined>;

  /** Tipo inicial ao criar (contexto do modal pai). */
  defaultType = input<CategoryType>('EXPENSE');

  /** Quando definido, entra em modo edição. */
  category = input<Category | undefined>(undefined);

  readonly presetColors = PRESET_COLORS;
  readonly iconOptions = CATEGORY_ICON_OPTIONS;
  readonly typeOptions = CATEGORY_TYPE_OPTIONS;

  saving = false;

  readonly isEdit = computed(() => !!this.category()?.id);

  readonly headerTitle = computed(() =>
    this.isEdit() ? 'Editar categoria' : 'Nova categoria',
  );

  readonly headerSubtitle = computed(() => {
    const type = this.form.get('type')?.value as CategoryType | null;
    if (type === 'INCOME') {
      return this.isEdit()
        ? 'Atualize os dados desta categoria de receita'
        : 'Crie uma categoria para organizar suas receitas';
    }
    return this.isEdit()
      ? 'Atualize os dados desta categoria de despesa'
      : 'Crie uma categoria para organizar suas despesas';
  });

  readonly submitLabel = computed(() => {
    if (this.saving) return 'Salvando...';
    return this.isEdit() ? 'Atualizar' : 'Criar categoria';
  });

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['EXPENSE' as CategoryType, [Validators.required]],
    color: [PRESET_COLORS[0]],
    icon: ['tag' satisfies CategoryIconSlug],
  });

  ngOnInit(): void {
    this.patchFromCategory();
  }

  selectColor(color: string): void {
    this.form.patchValue({ color });
  }

  selectIcon(slug: CategoryIconSlug): void {
    this.form.patchValue({ icon: slug });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;

    this.saving = true;
    const { name, type, color, icon } = this.form.getRawValue();
    const editing = this.category();

    const payload = {
      name: name!,
      type: type!,
      color: color ?? undefined,
      icon: (icon ?? 'tag') as CategoryIconSlug,
    };

    const req = editing?.id
      ? this.categoryService.update(editing.id, payload)
      : this.categoryService.create(payload);

    req.subscribe({
      next: (category) => {
        this.toast.success(
          editing?.id ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!',
        );
        this.__modalRef.close(category);
      },
      error: () => {
        this.toast.error(
          editing?.id
            ? 'Não foi possível atualizar a categoria. Tente novamente.'
            : 'Não foi possível criar a categoria. Tente novamente.',
        );
        this.saving = false;
      },
    });
  }

  onClose(): void {
    this.__modalRef.close(undefined);
  }

  private patchFromCategory(): void {
    const existing = this.category();
    if (existing) {
      this.form.patchValue({
        name: existing.name,
        type: existing.type,
        color: existing.color,
        icon: existing.icon as CategoryIconSlug,
      });
      return;
    }

    this.form.patchValue({ type: this.defaultType() });
  }
}
