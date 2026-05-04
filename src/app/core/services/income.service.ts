import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import type { Observable } from 'rxjs';
import type { Category } from './category.service';

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  notes?: string;
  categoryId: string;
  category: Category;
  createdAt: string;
}

export interface CreateIncomePayload {
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class IncomeService {
  private http = inject(HttpClient);

  create(payload: CreateIncomePayload): Observable<Income> {
    return this.http.post<Income>(`${environment.apiUrl}/incomes`, payload);
  }

  /** Atualiza uma receita (PUT) */
  update(incomeId: string, payload: CreateIncomePayload): Observable<Income> {
    return this.http.put<Income>(`${environment.apiUrl}/incomes/${incomeId}`, payload);
  }

  findAll(filters?: { month?: number; year?: number }): Observable<Income[]> {
    const params: Record<string, string> = {};
    if (filters?.month) params['month'] = filters.month.toString();
    if (filters?.year) params['year'] = filters.year.toString();

    return this.http.get<Income[]>(`${environment.apiUrl}/incomes`, { params });
  }

  remove(incomeId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/incomes/${incomeId}`);
  }
}
