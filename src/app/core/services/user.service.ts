import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { type Observable, tap } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  provider: string | null;
  monthlyExpenseGoal: number | null;
  expenseGoalConfirmedMonth: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly user$: Observable<User | null> = toObservable(this.currentUser);

  loadProfile(): Observable<User> {
    return this.http
      .get<User>(`${environment.apiUrl}/users/me`)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  setUser(user: User | null): void {
    this.currentUser.set(user);
  }

  updateProfile(data: { name: string; avatarFile?: File }): Observable<User> {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.avatarFile) {
      formData.append('avatar', data.avatarFile);
    }
    return this.http
      .patch<User>(`${environment.apiUrl}/users/me`, formData)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  updatePassword(data: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/users/me/password`, data);
  }

  updateExpenseGoal(amount: number | null): Observable<User> {
    return this.http
      .patch<User>(`${environment.apiUrl}/users/me/expense-goal`, { amount })
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  confirmExpenseGoalMonth(): Observable<User> {
    return this.http
      .patch<User>(`${environment.apiUrl}/users/me/expense-goal/confirm-month`, {})
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  clearUser(): void {
    this.currentUser.set(null);
    localStorage.removeItem('access_token');

    setTimeout(() => {
      this.router.navigate(['/auth/sign-in']);
    }, 300);
  }
}
