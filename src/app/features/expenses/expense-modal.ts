import { ToastService } from '@/shared/toast/toast.service';
import { Component, computed, inject, input, type OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import { INPUT_CONFIG } from '@ui/input/input.token';
import { Textbox } from '@ui/textbox/textbox';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { type Category, CategoryService } from '../../core/services/category.service';
import { type Expense, ExpenseService } from '../../core/services/expense.service';
import { Modal } from '../../shared/modal/modal';
import { type ModalRef, ModalService } from '../../shared/modal/modal.service';
import { parseAmountField } from '@/shared/parse-amount-field';
import { CreateCategoryModal } from '../categories/create-category-modal';

function ledgerAmountToNumber(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const n = parseAmountField(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function formatPtBrCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function toDateInputValue(isoDate: string): string {
  const slice = isoDate.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(slice)) return slice;
  try {
    return new Date(isoDate).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

@Component({
  selector: 'app-expense-modal',
  imports: [Modal, ReactiveFormsModule, Textbox, Button, LucideAngularModule],
  templateUrl: './expense-modal.html',
  styleUrl: './expense-modal.scss',
  providers: [
    { provide: BUTTON_CONFIG, useValue: { size: 'md', variant: 'primary' } },
    { provide: INPUT_CONFIG, useValue: { size: 'md', variant: 'default' } },
  ],
})
export class ExpenseModal implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private expenseService = inject(ExpenseService);
  private modalService = inject(ModalService);
  private toast = inject(ToastService);

  /** Injected by ModalService */
  __modalRef!: ModalRef<boolean | undefined>;

  /** Quando definido, o modal entra em modo edição. */
  expense = input<Expense | undefined>(undefined);

  readonly plusIcon = Plus;
  readonly categories = signal<Category[]>([]);

  readonly isEdit = computed(() => !!this.expense()?.id);
  readonly headerTitle = computed(() =>
    this.isEdit() ? 'Editar despesa' : 'Adicionar despesa',
  );
  readonly headerSubtitle = computed(() =>
    this.isEdit() ? 'Atualize os dados deste gasto' : 'Registre um novo gasto',
  );

  saving = false;

  form = this.fb.group({
    description: ['', [Validators.required]],
    amount: ['', [Validators.required]],
    date: [new Date().toISOString().split('T')[0], [Validators.required]],
    categoryId: ['', [Validators.required]],
    notes: [''],
  });

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

    const amount = parseAmountField(raw.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      this.saving = false;
      return;
    }

    const payload = {
      description: raw.description!,
      amount,
      date: raw.date!,
      categoryId: raw.categoryId!,
      notes: raw.notes || undefined,
    };

    const editing = this.expense();
    const req = editing?.id
      ? this.expenseService.update(editing.id, payload)
      : this.expenseService.create(payload);

    req.subscribe({
      next: () => {
        this.toast.success(
          editing?.id ? 'Despesa atualizada com sucesso!' : 'Despesa criada com sucesso!',
        );
        this.__modalRef.close(true);
      },
      error: () => {
        this.toast.error(
          editing?.id
            ? 'Não foi possível atualizar a despesa. Tente novamente.'
            : 'Não foi possível criar a despesa. Tente novamente.',
        );
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
      this.patchFromExpense();
    });
  }

  private patchFromExpense(): void {
    const e = this.expense();
    if (!e) return;

    const amountNum = ledgerAmountToNumber(e.amount);
    this.form.patchValue({
      description: e.description,
      amount: formatPtBrCurrency(amountNum),
      date: toDateInputValue(e.date),
      categoryId: e.categoryId,
      notes: e.notes ?? '',
    });
  }
}
