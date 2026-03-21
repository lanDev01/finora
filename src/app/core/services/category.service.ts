import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { BehaviorSubject, type Observable, tap } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface CreateCategoryPayload {
  name: string;
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
  loadCategories(): Observable<Category[]> {
    return this.http
      .get<Category[]>(`${environment.apiUrl}/categories`)
      .pipe(tap((categories) => this.categoriesSubject.next(categories)));
  }

  /** Cria uma nova categoria e atualiza a lista */
  create(payload: CreateCategoryPayload): Observable<Category> {
    return this.http.post<Category>(`${environment.apiUrl}/categories`, payload);
  }

  /** Remove uma categoria */
  remove(categoryId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/categories/${categoryId}`);
  }
}
