// biome-ignore assist/source/organizeImports: <explanation>
import {
  type AfterViewInit,
  Component,
  forwardRef,
  inject,
  Injector,
  input,
  signal,
} from '@angular/core';
import {
  type ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { Input } from '@ui/input/input';
import { INPUT_CONFIG, type InputConfig } from '@ui/input/input.token';
import { Label } from '@ui/label/label';
import { merge } from 'rxjs';

@Component({
  selector: 'app-textbox',
  imports: [ReactiveFormsModule, Label, Input],
  templateUrl: './textbox.html',
  styleUrl: './textbox.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Textbox),
      multi: true,
    },
  ],
})
export class Textbox implements ControlValueAccessor, AfterViewInit {
  protected config = inject(INPUT_CONFIG);
  private injector = inject(Injector);

  label = input<string>('');
  placeholder = input<string>(this.config.placeholder ?? '');
  size = input<InputConfig['size']>(this.config.size ?? 'md');
  variant = input<InputConfig['variant']>(this.config.variant ?? 'default');
  disabled = input<boolean>(this.config.disabled ?? false);
  type = input<string>('text');

  protected readonly id = `textbox-${Math.random().toString(36).slice(2, 7)}`;
  protected readonly control = new FormControl('');
  protected hasError = signal(false);

  private onChange = (_: any) => {};
  private onTouched = () => {};

  constructor() {
    this.control.valueChanges.subscribe((value) => {
      this.onChange(value);
      this.onTouched();
    });
  }

  ngAfterViewInit() {
    const ngControl = this.injector.get(NgControl, null, { self: true, optional: true });
    const externalControl = ngControl?.control;

    if (!externalControl) return;

    merge(
      externalControl.statusChanges,
      externalControl.valueChanges,
      externalControl.parent?.statusChanges ?? [],
    ).subscribe(() => {
      this.hasError.set(externalControl.invalid && externalControl.touched);
    });
  }

  writeValue(value: string) {
    this.control.setValue(value ?? '', { emitEvent: false });
  }
  registerOnChange(fn: any) {
    this.onChange = fn;
  }
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean) {
    disabled ? this.control.disable() : this.control.enable();
  }
}
