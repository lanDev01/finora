import { Component, inject, type OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import { INPUT_CONFIG } from '@ui/input/input.token';
import { Textbox } from '@ui/textbox/textbox';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { type Category, CategoryService } from '../../core/services/category.service';
import { ExpenseService } from '../../core/services/expense.service';
import { Modal } from '../../shared/modal/modal';
import { type ModalRef, ModalService } from '../../shared/modal/modal.service';
import { CreateCategoryModal } from '../categories/create-category-modal';

@Component({
  selector: 'app-create-expense-modal',
  imports: [Modal, ReactiveFormsModule, Textbox, Button, LucideAngularModule],
  template: `
    <app-modal title="Adicionar despesa" subtitle="Registre um novo gasto" (closed)="onClose()">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <app-textbox
            label="Descrição"
            placeholder="Ex: Almoço no restaurante"
            formControlName="description"
          />
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <app-textbox label="Valor (R$)" placeholder="0,00" formControlName="amount" />
          </div>
          <div class="form-group flex-1">
            <app-textbox label="Data" type="date" formControlName="date" />
          </div>
        </div>

        <div class="form-group">
          <label class="field-label" for="category-select">Categoria</label>
          <div class="category-row">
            <div class="select-wrapper">
              <select id="category-select" class="category-select" formControlName="categoryId">
                <option value="" disabled>Selecione uma categoria</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">
                    {{ cat.name }}
                  </option>
                }
              </select>
              <!-- Color indicator for selected category -->
              @if (selectedCategory(); as cat) {
                <span class="selected-color" [style.background-color]="cat.color"></span>
              }
            </div>
            <button
              type="button"
              class="add-category-btn"
              title="Nova categoria"
              (click)="openCreateCategory()"
            >
              <lucide-icon [img]="plusIcon" [size]="18" />
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="field-label" for="notes-textarea">Observação</label>
          <textarea
            id="notes-textarea"
            class="notes-textarea"
            formControlName="notes"
            placeholder="Observação opcional..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-actions">
          <app-button type="button" variant="ghost" (clicked)="onClose()">Cancelar</app-button>
          <app-button type="submit" [disabled]="form.invalid || saving">
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: `
    .form-group {
      margin-bottom: var(--spacing-lg);
    }

    .form-row {
      display: flex;
      gap: var(--spacing-md);
    }

    .flex-1 {
      flex: 1;
    }

    .field-label {
      display: block;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--foreground);
      margin-bottom: var(--spacing-sm);
    }

    .category-row {
      display: flex;
      gap: var(--spacing-sm);
      align-items: center;
    }

    .select-wrapper {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }

    .category-select {
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
      transition:
        border-color var(--transition-base),
        box-shadow var(--transition-base);

      &:focus {
        border-color: var(--input-focus);
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 20%, transparent);
      }
    }

    .selected-color {
      position: absolute;
      left: 0.75rem;
      width: 12px;
      height: 12px;
      border-radius: var(--radius-full);
      pointer-events: none;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .add-category-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background-color: var(--background-subtle);
      color: var(--foreground-muted);
      cursor: pointer;
      flex-shrink: 0;
      transition:
        background-color var(--transition-fast),
        color var(--transition-fast),
        border-color var(--transition-fast);

      &:hover {
        background-color: var(--primary);
        color: var(--primary-foreground);
        border-color: var(--primary);
      }
    }

    .notes-textarea {
      width: 100%;
      padding: 0.5rem 0.75rem;
      font-family: inherit;
      font-size: var(--font-size-base);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background-color: var(--background-subtle);
      color: var(--foreground);
      outline: none;
      resize: vertical;
      min-height: 80px;
      transition:
        border-color var(--transition-base),
        box-shadow var(--transition-base);

      &::placeholder {
        color: var(--foreground-subtle);
      }

      &:focus {
        border-color: var(--input-focus);
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 20%, transparent);
      }
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
export class CreateExpenseModal implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private expenseService = inject(ExpenseService);
  private modalService = inject(ModalService);

  /** Injected by ModalService */
  __modalRef!: ModalRef<boolean | undefined>;

  readonly plusIcon = Plus;
  readonly categories = signal<Category[]>([]);

  saving = false;

  form = this.fb.group({
    description: ['', [Validators.required]],
    amount: ['', [Validators.required]],
    date: [new Date().toISOString().split('T')[0], [Validators.required]],
    categoryId: ['', [Validators.required]],
    notes: [''],
  });

  /** Returns the selected category object from the list */
  selectedCategory = () => {
    const id = this.form.get('categoryId')?.value;
    return this.categories().find((c) => c.id === id) ?? null;
  };

  ngOnInit(): void {
    this.loadCategories();
  }

  openCreateCategory(): void {
    const ref = this.modalService.open(CreateCategoryModal);
    ref.afterClosed().subscribe((newCategory) => {
      if (newCategory) {
        this.categoryService.loadCategories().subscribe((cats) => {
          this.categories.set(cats);
          this.form.patchValue({ categoryId: newCategory.id });
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;

    this.saving = true;
    const raw = this.form.getRawValue();

    const amount = parseFloat(raw.amount!.replace(',', '.'));
    if (Number.isNaN(amount) || amount <= 0) {
      this.saving = false;
      return;
    }

    this.expenseService
      .create({
        description: raw.description!,
        amount,
        date: raw.date!,
        categoryId: raw.categoryId!,
        notes: raw.notes || undefined,
      })
      .subscribe({
        next: () => {
          this.__modalRef.close(true);
        },
        error: () => {
          this.saving = false;
        },
      });
  }

  onClose(): void {
    this.__modalRef.close(undefined);
  }

  private loadCategories(): void {
    this.categoryService.loadCategories().subscribe((cats) => {
      this.categories.set(cats);
    });
  }
}
