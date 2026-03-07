import { Component, input } from '@angular/core';

@Component({
  selector: 'app-label',
  imports: [],
  templateUrl: './label.html',
  styleUrl: './label.scss',
})
export class Label {
  for = input<string>('');
  error = input<boolean>(false);
}
