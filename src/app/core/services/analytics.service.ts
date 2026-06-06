import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import type { Observable } from 'rxjs';

export interface DashboardSummary {
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
  incomePercentChange: number;
  expensePercentChange: number;
  balancePercentChange: number;
}

export interface CategoryBreakdownItem {
  name: string;
  color: string;
  total: number;
}

export interface EvolutionPoint {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface PeriodTotals {
  month: string;
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
}

export interface PeriodComparison {
  current: PeriodTotals & { expensesByCategory: CategoryBreakdownItem[] };
  compare: PeriodTotals & { expensesByCategory: CategoryBreakdownItem[] };
}

export type CategoryLedgerType = 'EXPENSE' | 'INCOME';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/analytics`;

  private query(params: Record<string, string | number | undefined>): string {
    const q = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value != null && value !== '') q.set(key, String(value));
    }
    const s = q.toString();
    return s ? `?${s}` : '';
  }

  getDashboard(params?: { month?: number; year?: number }): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.base}/dashboard${this.query(params ?? {})}`);
  }

  getEvolution(months = 12): Observable<EvolutionPoint[]> {
    return this.http.get<EvolutionPoint[]>(`${this.base}/evolution${this.query({ months })}`);
  }

  getCompare(params: {
    month: number;
    year: number;
    compareMonth?: number;
    compareYear?: number;
  }): Observable<PeriodComparison> {
    return this.http.get<PeriodComparison>(`${this.base}/compare${this.query(params)}`);
  }

  getByCategory(params: {
    month: number;
    year: number;
    type?: CategoryLedgerType;
  }): Observable<CategoryBreakdownItem[]> {
    return this.http.get<CategoryBreakdownItem[]>(
      `${this.base}/by-category${this.query(params)}`,
    );
  }
}
