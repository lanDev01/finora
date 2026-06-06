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
  {
    path: 'categorias',
    loadComponent: () =>
      import('./pages/categories-page/categories-page').then((c) => c.CategoriesPage),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../dashboard/pages/dashboard-page/dashboard-page').then((c) => c.DashboardPage),
    canActivate: [authGuard],
  },
];
