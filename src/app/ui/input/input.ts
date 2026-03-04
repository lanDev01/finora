import { Component, forwardRef, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { INPUT_CONFIG, InputConfig } from './input.token';

@Component({
  selector: 'app-input',
  imports: [],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Input),
      multi: true,
    },
  ],
  host: {
    '[class.size-sm]': 'size() === "sm"',
    '[class.size-md]': 'size() === "md"',
    '[class.size-lg]': 'size() === "lg"',
    '[class.variant-filled]': 'variant() === "filled"',
    '[class.variant-ghost]': 'variant() === "ghost"',
    '[class.is-disabled]': 'disabled()',
  },
})
export class Input implements ControlValueAccessor {
  protected config = inject(INPUT_CONFIG);

  placeholder = input<string>(this.config.placeholder ?? '');
  size = input<InputConfig['size']>(this.config.size ?? 'md');
  variant = input<InputConfig['variant']>(this.config.variant ?? 'default');
  disabled = input<boolean>(this.config.disabled ?? false);

  protected value = '';
  protected onChange = (_: any) => {};
  protected onTouched = () => {};

  writeValue(value: string) {
    this.value = value ?? '';
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
}
