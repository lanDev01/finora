import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'theme';

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const storedTheme = this.getStoredTheme();

    if (storedTheme) {
      this.setTheme(storedTheme);
      return;
    }

    const systemTheme = this.getSystemTheme();
    this.setTheme(systemTheme);
  }

  private getStoredTheme(): Theme | null {
    const theme = localStorage.getItem(this.STORAGE_KEY);

    if (theme === 'light' || theme === 'dark') {
      return theme;
    }

    return null;
  }

  private getSystemTheme(): Theme {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return prefersDark ? 'dark' : 'light';
  }

  getCurrentTheme(): Theme {
    const theme = document.documentElement.getAttribute('data-theme');

    return theme === 'dark' ? 'dark' : 'light';
  }

  setTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);

    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  toggleTheme(): void {
    const current = this.getCurrentTheme();

    const next: Theme = current === 'dark' ? 'light' : 'dark';

    this.setTheme(next);
  }

  isDarkMode(): boolean {
    return this.getCurrentTheme() === 'dark';
  }
}
