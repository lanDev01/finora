import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import type { CategoryType } from '@/features/categories/category-type-options';
import { BehaviorSubject, type Observable, tap } from 'rxjs';

export type { CategoryType };

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: CategoryType;
}

export interface CreateCategoryPayload {
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  type?: CategoryType;
  color?: string;
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  private categoriesSubject = new BehaviorSubject<Category[]>([]);

  /** Observable reativo com a lista de categorias do usuário */
  readonly categories$: Observable<Category[]> = this.categoriesSubject.asObservable();

  /** Carrega categorias da API e atualiza o observable */
  loadCategories(filters?: { type?: CategoryType }): Observable<Category[]> {
    let params = new HttpParams();
    if (filters?.type) {
      params = params.set('type', filters.type);
    }

    return this.http
      .get<Category[]>(`${environment.apiUrl}/categories`, { params })
      .pipe(tap((categories) => this.categoriesSubject.next(categories)));
  }

  /** Cria uma nova categoria e atualiza a lista */
  create(payload: CreateCategoryPayload): Observable<Category> {
    return this.http.post<Category>(`${environment.apiUrl}/categories`, payload);
  }

  /** Atualiza uma categoria */
  update(categoryId: string, payload: UpdateCategoryPayload): Observable<Category> {
    return this.http.patch<Category>(`${environment.apiUrl}/categories/${categoryId}`, payload);
  }

  /** Remove uma categoria */
  remove(categoryId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/categories/${categoryId}`);
  }
}
