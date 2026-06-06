import { Component, input } from '@angular/core';
import { LucideAngularModule, PieChart, type LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-chart-empty-state',
  imports: [LucideAngularModule],
  templateUrl: './chart-empty-state.html',
  styleUrl: './chart-empty-state.scss',
})
export class ChartEmptyState {
  message = input.required<string>();
  icon = input<LucideIconData>(PieChart);
  iconSize = input<number>(40);
}
