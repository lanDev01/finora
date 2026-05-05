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

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);

  /** Totais do mês (receitas, despesas, saldo) e variação % vs mês anterior */
  getDashboard(params?: { month?: number; year?: number }): Observable<DashboardSummary> {
    const q = new URLSearchParams();
    if (params?.month != null) q.set('month', String(params.month));
    if (params?.year != null) q.set('year', String(params.year));
    const suffix = q.toString() ? `?${q.toString()}` : '';
    return this.http.get<DashboardSummary>(`${environment.apiUrl}/analytics/dashboard${suffix}`);
  }
}
