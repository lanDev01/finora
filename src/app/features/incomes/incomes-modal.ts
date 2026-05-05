import { ToastService } from '@/shared/toast/toast.service';
import { Component, computed, inject, input, type OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import { INPUT_CONFIG } from '@ui/input/input.token';
import { Textbox } from '@ui/textbox/textbox';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { type Category, CategoryService } from '../../core/services/category.service';
import { type Income, IncomeService } from '../../core/services/income.service';
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
  selector: 'app-incomes-modal',
  imports: [Modal, ReactiveFormsModule, Textbox, Button, LucideAngularModule],
  templateUrl: './incomes-modal.html',
  styleUrl: './incomes-modal.scss',
  providers: [
    { provide: BUTTON_CONFIG, useValue: { size: 'md', variant: 'primary' } },
    { provide: INPUT_CONFIG, useValue: { size: 'md', variant: 'default' } },
  ],
})
export class IncomesModal implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private incomeService = inject(IncomeService);
  private modalService = inject(ModalService);
  private toast = inject(ToastService);

  __modalRef!: ModalRef<boolean | undefined>;

  income = input<Income | undefined>(undefined);

  readonly plusIcon = Plus;
  readonly categories = signal<Category[]>([]);

  readonly isEdit = computed(() => !!this.income()?.id);
  readonly headerTitle = computed(() => (this.isEdit() ? 'Editar receita' : 'Adicionar receita'));
  readonly headerSubtitle = computed(() =>
    this.isEdit() ? 'Atualize os dados desta entrada' : 'Registre uma nova entrada',
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

    const editing = this.income();
    const req = editing?.id
      ? this.incomeService.update(editing.id, payload)
      : this.incomeService.create(payload);

    req.subscribe({
      next: () => {
        this.toast.success(
          editing?.id ? 'Receita atualizada com sucesso!' : 'Receita criada com sucesso!',
        );
        this.__modalRef.close(true);
      },
      error: () => {
        this.toast.error(
          editing?.id
            ? 'Não foi possível atualizar a receita. Tente novamente.'
            : 'Não foi possível criar a receita. Tente novamente.',
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
      this.patchFromIncome();
    });
  }

  private patchFromIncome(): void {
    const row = this.income();
    if (!row) return;

    const amountNum = ledgerAmountToNumber(row.amount);
    this.form.patchValue({
      description: row.description,
      amount: formatPtBrCurrency(amountNum),
      date: toDateInputValue(row.date),
      categoryId: row.categoryId,
      notes: row.notes ?? '',
    });
  }
}
