import type { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home').then((c) => c.Home),
    canActivate: [authGuard],
  },
  {
    path: 'receitas',
    loadComponent: () => import('./pages/incomes-page/incomes-page').then((c) => c.IncomesPage),
    canActivate: [authGuard],
  },
  {
    path: 'despesas',
    loadComponent: () => import('./pages/expenses-page/expenses-page').then((c) => c.ExpensesPage),
    canActivate: [authGuard],
  },
];
