import { InjectionToken } from '@angular/core';

export interface ButtonConfig {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const BUTTON_CONFIG = new InjectionToken<ButtonConfig>('BUTTON_CONFIG', {
  factory: () => ({
    size: 'md',
    variant: 'primary',
    loading: false,
    disabled: false,
    fullWidth: false,
  }),
});
