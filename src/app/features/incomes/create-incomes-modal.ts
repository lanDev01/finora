import { ToastService } from '@/shared/toast/toast.service';
import { Component, inject, type OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import { INPUT_CONFIG } from '@ui/input/input.token';
import { Textbox } from '@ui/textbox/textbox';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { type Category, CategoryService } from '../../core/services/category.service';
import { IncomeService } from '../../core/services/income.service';
import { Modal } from '../../shared/modal/modal';
import { type ModalRef, ModalService } from '../../shared/modal/modal.service';
import { CreateCategoryModal } from '../categories/create-category-modal';

@Component({
  selector: 'app-create-incomes-modal',
  imports: [Modal, ReactiveFormsModule, Textbox, Button, LucideAngularModule],
  templateUrl: './create-incomes-modal.html',
  styleUrl: './create-incomes-modal.scss',
  providers: [
    { provide: BUTTON_CONFIG, useValue: { size: 'md', variant: 'primary' } },
    { provide: INPUT_CONFIG, useValue: { size: 'md', variant: 'default' } },
  ],
})
export class CreateIncomesModal implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private incomeService = inject(IncomeService);
  private modalService = inject(ModalService);
  private toast = inject(ToastService);
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

    this.incomeService
      .create({
        description: raw.description!,
        amount,
        date: raw.date!,
        categoryId: raw.categoryId!,
        notes: raw.notes || undefined,
      })
      .subscribe({
        next: () => {
          this.toast.success('Receita criada com sucesso!');
          this.__modalRef.close(true);
        },
        error: () => {
          this.toast.error('Não foi possível criar a receita. Tente novamente.');
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
