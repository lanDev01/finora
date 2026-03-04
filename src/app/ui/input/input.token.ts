import { InjectionToken } from '@angular/core';

export interface InputConfig {
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'ghost';
  disabled?: boolean;
}

export const INPUT_CONFIG = new InjectionToken<InputConfig>('INPUT_CONFIG', {
  factory: () => ({
    placeholder: '',
    size: 'md',
    variant: 'default',
    disabled: false,
  }),
});
