import { type Category, CategoryService } from '@/core/services/category.service';
import { CreateCategoryModal } from '@/features/categories/create-category-modal';
import { categoryTypeLabel } from '@/features/categories/category-type-options';
import { Header } from '@/layout/header/header';
import { ModalService } from '@/shared/modal/modal.service';
import { ToastService } from '@/shared/toast/toast.service';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import {
  DEFAULT_TABLE_ROW_ACTIONS,
  Table,
  type TableColumn,
  type TableRowAction,
} from '@ui/table/table';
import { Component, inject, type OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-categories-page',
  imports: [Header, RouterLink, Button, Table],
  templateUrl: './categories-page.html',
  styleUrl: './categories-page.scss',
  providers: [{ provide: BUTTON_CONFIG, useValue: { size: 'md', variant: 'primary' } }],
})
export class CategoriesPage implements OnInit {
  private modalService = inject(ModalService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);

  categories = signal<Category[]>([]);
  categoriesLoading = signal(true);

  categoriesRows = (): Record<string, unknown>[] =>
    this.categories().map((category) => ({
      ...category,
      typeLabel: categoryTypeLabel(category.type),
      category: { name: category.name, color: category.color },
    }));

  readonly categoryColumns: TableColumn[] = [
    { field: 'category', header: 'Nome', isBadge: true },
    { field: 'typeLabel', header: 'Tipo' },
  ];

  readonly categoryRowActions: TableRowAction[] = DEFAULT_TABLE_ROW_ACTIONS;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoryService.loadCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.categoriesLoading.set(false);
      },
      error: () => this.categoriesLoading.set(false),
    });
  }

  openNewCategoryModal(): void {
    const ref = this.modalService.open(CreateCategoryModal, { defaultType: 'EXPENSE' });
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.loadCategories();
    });
  }

  openEditCategoryModal(row: Record<string, unknown>): void {
    const id = row['id'] as string;
    const category = this.categories().find((c) => c.id === id);
    if (!category) return;

    const ref = this.modalService.open(CreateCategoryModal, { category });
    ref.afterClosed().subscribe((saved) => {
      if (saved) this.loadCategories();
    });
  }

  onCategoryTableAction(event: { action: string; row: Record<string, unknown> }): void {
    if (event.action === 'delete') {
      this.deleteCategory(event.row);
      return;
    }
    if (event.action === 'edit') {
      this.openEditCategoryModal(event.row);
    }
  }

  private deleteCategory(row: Record<string, unknown>): void {
    const id = row['id'] as string;
    this.categoryService.remove(id).subscribe({
      next: () => {
        this.toast.success('Categoria excluída com sucesso!');
        this.loadCategories();
      },
      error: () => {
        this.toast.error(
          'Não foi possível excluir a categoria. Verifique se há despesas ou receitas vinculadas.',
        );
      },
    });
  }
}
