import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  template: `
    <a class="logo" routerLink="/home" aria-label="Ir para a página inicial">
      <span class="logo-icon">F</span>
      <span class="logo-text">FINORA</span>
    </a>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      text-decoration: none;
      cursor: pointer;
      transition: opacity var(--transition-fast);

      &:hover {
        opacity: 0.85;
      }
    }

    .logo-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary), var(--color-indigo-500));
      color: var(--color-white);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-bold);
      line-height: 1;
      letter-spacing: -0.5px;
    }

    .logo-text {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--foreground);
      letter-spacing: 1.5px;
    }

    @media (max-width: 480px) {
      .logo-text {
        display: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Logo {}
