import { Component, input } from '@angular/core';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';

export interface SummaryCardData {
  title: string;
  value: string;
  icon: LucideIconData;
  change: string;
  highlight?: boolean;
  type: 'positive' | 'negative' | 'neutral';
}

@Component({
  selector: 'app-summary-card',
  imports: [LucideAngularModule],
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.scss',
})
export class SummaryCard {
  title = input.required<string>();
  value = input.required<string>();
  icon = input.required<LucideIconData>();
  change = input.required<string>();

  highlight = input<boolean>();
  type = input<'positive' | 'negative' | 'neutral'>('neutral');
}
