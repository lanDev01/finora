import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import type { Observable } from 'rxjs';
import type { Category } from './category.service';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  notes?: string;
  categoryId: string;
  category: Category;
  createdAt: string;
}

export interface CreateExpensePayload {
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private http = inject(HttpClient);

  /** Cria uma nova despesa */
  create(payload: CreateExpensePayload): Observable<Expense> {
    return this.http.post<Expense>(`${environment.apiUrl}/expenses`, payload);
  }

  /** Atualiza uma despesa (PUT) */
  update(expenseId: string, payload: CreateExpensePayload): Observable<Expense> {
    return this.http.put<Expense>(`${environment.apiUrl}/expenses/${expenseId}`, payload);
  }

  /** Lista despesas com filtro opcional por mês/ano */
  findAll(filters?: { month?: number; year?: number }): Observable<Expense[]> {
    const params: Record<string, string> = {};
    if (filters?.month) params['month'] = filters.month.toString();
    if (filters?.year) params['year'] = filters.year.toString();

    return this.http.get<Expense[]>(`${environment.apiUrl}/expenses`, { params });
  }

  /** Remove uma despesa */
  remove(expenseId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/expenses/${expenseId}`);
  }
}
