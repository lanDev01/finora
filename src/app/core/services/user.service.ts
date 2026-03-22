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
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private router = inject(Router);

  /** Signal reativo com os dados do usuário logado */
  readonly currentUser = signal<User | null>(null);

  /** Observable derivado do signal para compatibilidade com RxJS */
  readonly user$: Observable<User | null> = toObservable(this.currentUser);

  /** Busca o perfil do usuário autenticado na API e atualiza o signal */
  loadProfile(): Observable<User> {
    return this.http
      .get<User>(`${environment.apiUrl}/users/me`)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  /** Atualiza os dados do usuário no signal */
  setUser(user: User | null): void {
    this.currentUser.set(user);
  }

  /** Atualiza nome e/ou avatar do perfil */
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

  /** Atualiza a senha do usuário */
  updatePassword(data: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/users/me/password`, data);
  }

  /** Limpa os dados do usuário (logout) */
  clearUser(): void {
    this.currentUser.set(null);
    localStorage.removeItem('access_token');

    setTimeout(() => {
      this.router.navigate(['/auth/sign-in']);
    }, 300);
  }
}
