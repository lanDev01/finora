import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { Chart, type ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-chart',
  template: '<canvas #canvas role="img" [attr.aria-label]="ariaLabel()"></canvas>',
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 220px;
    }

    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  `,
})
export class ChartComponent implements AfterViewInit, OnDestroy {
  config = input.required<ChartConfiguration>();
  ariaLabel = input<string>('Gráfico');

  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;
  private viewReady = false;

  constructor() {
    effect(() => {
      const cfg = this.config();
      if (!this.viewReady) return;
      this.render(cfg);
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.render(this.config());
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(cfg: ChartConfiguration): void {
    const el = this.canvas().nativeElement;
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart(el, cfg);
  }
}
