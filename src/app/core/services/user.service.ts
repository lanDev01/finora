import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { BehaviorSubject, type Observable, tap } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private userSubject = new BehaviorSubject<User | null>(null);

  /** Observable reativo com os dados do usuário logado */
  readonly user$: Observable<User | null> = this.userSubject.asObservable();

  /** Retorna o valor atual do usuário (snapshot) */
  get currentUser(): User | null {
    return this.userSubject.getValue();
  }

  /** Busca o perfil do usuário autenticado na API e atualiza o observable */
  loadProfile(): Observable<User> {
    return this.http
      .get<User>(`${environment.apiUrl}/users/me`)
      .pipe(tap((user) => this.userSubject.next(user)));
  }

  /** Atualiza manualmente os dados do usuário no observable */
  setUser(user: User | null): void {
    this.userSubject.next(user);
  }

  /** Limpa os dados do usuário (logout) */
  clearUser(): void {
    this.userSubject.next(null);
    localStorage.removeItem('access_token');

    setTimeout(() => {
      this.router.navigate(['/auth/sign-in']);
    }, 300);
  }
}
