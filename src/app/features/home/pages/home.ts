import { SummaryCard, type SummaryCardData } from '@/components/summary-card/summary-card';
import { Header } from '@/layout/header/header';
import { AsyncPipe } from '@angular/common';
import { Component, inject, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from '@ui/button/button';
import { BUTTON_CONFIG } from '@ui/button/button.token';
import { PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-angular';
import { map, type Observable } from 'rxjs';
import { type User, UserService } from '../../../core/services/user.service';
import { ModalService } from '../../../shared/modal/modal.service';
import { CreateExpenseModal } from '../../expenses/create-expense-modal';

@Component({
  selector: 'app-home',
  imports: [Header, Button, SummaryCard, AsyncPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  providers: [{ provide: BUTTON_CONFIG, useValue: { size: 'md', variant: 'primary' } }],
})
export class Home implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private modalService = inject(ModalService);

  /** Observable com os dados do usuário logado */
  readonly user$: Observable<User | null> = this.userService.user$;

  /** Nome do usuário para exibição (com fallback) */
  readonly userName$: Observable<string> = this.user$.pipe(map((user) => user?.name ?? 'Usuário'));

  cards: SummaryCardData[] = [
    {
      title: 'Saldo Total',
      value: 'R$ 12.450,00',
      icon: Wallet,
      change: '+12.5%',
      type: 'positive',
      highlight: true,
    },
    {
      title: 'Receitas',
      value: 'R$ 18.200,00',
      icon: TrendingUp,
      change: '+8.2%',
      type: 'positive',
    },
    {
      title: 'Despesas',
      value: 'R$ 5.750,00',
      icon: TrendingDown,
      change: '-3.1%',
      type: 'negative',
    },
    {
      title: 'Economia',
      value: 'R$ 6.450,00',
      icon: PiggyBank,
      change: '+15.7%',
      type: 'positive',
    },
  ];

  ngOnInit(): void {
    if (!this.userService.currentUser) {
      const token = localStorage.getItem('access_token');

      if (!token) {
        this.router.navigate(['/auth/sign-in']);
        return;
      }

      this.userService.loadProfile().subscribe({
        error: () => {
          localStorage.removeItem('access_token');
          this.router.navigate(['/auth/sign-in']);
        },
      });
    }
  }

  openNewExpenseModal(): void {
    this.modalService.open(CreateExpenseModal);
  }
}
