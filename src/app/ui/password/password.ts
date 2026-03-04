import { Component, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Eye, EyeOff, LucideAngularModule } from 'lucide-angular';
import { INPUT_CONFIG, InputConfig } from '../input/input.token';

@Component({
  selector: 'app-password',
  imports: [LucideAngularModule],
  templateUrl: './password.html',
  styleUrl: './password.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Password),
      multi: true,
    },
  ],
  host: {
    '[class.size-sm]': 'size() === "sm"',
    '[class.size-md]': 'size() === "md"',
    '[class.size-lg]': 'size() === "lg"',
    '[class.is-disabled]': 'disabled()',
  },
})
export class Password implements ControlValueAccessor {
  protected config = inject(INPUT_CONFIG);

  placeholder = input<string>(this.config.placeholder ?? '');
  size = input<InputConfig['size']>(this.config.size ?? 'md');
  disabled = input<boolean>(this.config.disabled ?? false);

  protected readonly Eye = Eye;
  protected readonly EyeOff = EyeOff;
  protected value = '';
  protected visible = signal(false);
  protected onChange = (_: any) => {};
  protected onTouched = () => {};

  toggleVisibility() {
    this.visible.set(!this.visible());
  }

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
