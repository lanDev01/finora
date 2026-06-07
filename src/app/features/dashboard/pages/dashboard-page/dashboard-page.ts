import { SummaryCard, type SummaryCardData } from '@/components/summary-card/summary-card';
import {
  AnalyticsService,
  type DashboardSummary,
  type EvolutionPoint,
  type PeriodComparison,
} from '@/core/services/analytics.service';
import {
  CompareMode,
  currentUtcMonthYear,
  formatPeriodComparisonDelta,
  formatMonthKeyLabel,
  formatBrl,
  monthInputFromParts,
  partsFromMonthInput,
  previousMonth,
} from '@/features/dashboard/dashboard.utils';
import { ChartEmptyState } from '@/features/dashboard/components/chart-empty-state/chart-empty-state';
import {
  CHART_SERIES_COLORS,
  COMPARISON_BAR_COLORS,
  resolveChartTheme,
  type ChartThemeColors,
} from '@/features/dashboard/chart-theme';
import { ThemeService } from '@/core/services/theme.service';
import { Header } from '@/layout/header/header';
import { ChartComponent } from '@/ui/chart/chart';
import { Component, computed, inject, type OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { ChartConfiguration } from 'chart.js';
import { ArrowLeft, LucideAngularModule, TrendingDown, TrendingUp, Wallet } from 'lucide-angular';
import { forkJoin } from 'rxjs';

function defaultPeriodInput(): string {
  const { month, year } = currentUtcMonthYear();
  return monthInputFromParts(month, year);
}

function defaultComparePeriodInput(): string {
  const { month, year } = currentUtcMonthYear();
  const prev = previousMonth(month, year);
  return monthInputFromParts(prev.month, prev.year);
}

@Component({
  selector: 'app-dashboard-page',
  imports: [Header, SummaryCard, ChartComponent, ChartEmptyState, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private analytics = inject(AnalyticsService);
  private themeService = inject(ThemeService);

  readonly loading = signal(true);
  readonly evolution = signal<EvolutionPoint[]>([]);
  readonly comparison = signal<PeriodComparison | null>(null);
  readonly dashboard = signal<DashboardSummary | null>(null);

  readonly compareMode = signal<CompareMode>('previous');
  readonly periodInput = signal(defaultPeriodInput());
  readonly comparePeriodInput = signal(defaultComparePeriodInput());

  readonly cards = computed(() => {
    const d = this.dashboard();
    if (!d) return this.placeholderCards();

    const incomeDelta = formatPeriodComparisonDelta(d.incomeTotal, d.previousIncomeTotal, {
      higherIsBetter: true,
    });
    const expenseDelta = formatPeriodComparisonDelta(d.expenseTotal, d.previousExpenseTotal, {
      higherIsBetter: false,
    });
    const balanceDelta = formatPeriodComparisonDelta(d.balance, d.previousBalance, {
      higherIsBetter: true,
    });
    const balanceType: SummaryCardData['type'] = d.balance >= 0 ? 'positive' : 'negative';

    return [
      {
        title: 'Receitas',
        value: formatBrl(d.incomeTotal),
        icon: TrendingUp,
        change: incomeDelta.label,
        type: 'positive' as const,
      },
      {
        title: 'Despesas',
        value: formatBrl(d.expenseTotal),
        icon: TrendingDown,
        change: expenseDelta.label,
        type: 'negative' as const,
      },
      {
        title: 'Saldo',
        value: formatBrl(d.balance),
        icon: Wallet,
        change: balanceDelta.label,
        type: balanceType,
        highlight: true,
      },
    ];
  });

  readonly periodLabel = computed(() => {
    const parts = partsFromMonthInput(this.periodInput());
    if (!parts) return '';
    return formatMonthKeyLabel(monthInputFromParts(parts.month, parts.year), 'long');
  });

  readonly compareLabel = computed(() => {
    const mode = this.compareMode();
    if (mode === 'none') return null;
    if (mode === 'previous') {
      const parts = partsFromMonthInput(this.periodInput());
      if (!parts) return null;
      const prev = previousMonth(parts.month, parts.year);
      return formatMonthKeyLabel(monthInputFromParts(prev.month, prev.year), 'long');
    }
    const parts = partsFromMonthInput(this.comparePeriodInput());
    return parts ? formatMonthKeyLabel(this.comparePeriodInput(), 'long') : null;
  });

  readonly evolutionChart = computed<ChartConfiguration>(() => {
    this.themeService.theme();
    const theme = resolveChartTheme();
    const points = this.evolution();
    const labels = points.map((p) => formatMonthKeyLabel(p.month));
    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Receitas',
            data: points.map((p) => p.income),
            borderColor: CHART_SERIES_COLORS.income,
            backgroundColor: CHART_SERIES_COLORS.incomeFill,
            fill: true,
            tension: 0.35,
          },
          {
            label: 'Despesas',
            data: points.map((p) => p.expense),
            borderColor: CHART_SERIES_COLORS.expense,
            backgroundColor: CHART_SERIES_COLORS.expenseFill,
            fill: true,
            tension: 0.35,
          },
          {
            label: 'Saldo',
            data: points.map((p) => p.balance),
            borderColor: CHART_SERIES_COLORS.balance,
            borderDash: [6, 4],
            tension: 0.35,
          },
        ],
      },
      options: this.lineOptions(theme),
    };
  });

  readonly comparisonChart = computed<ChartConfiguration | null>(() => {
    this.themeService.theme();
    const theme = resolveChartTheme();
    const data = this.comparison();
    const mode = this.compareMode();
    if (!data || mode === 'none') return null;

    const currentLabel = formatMonthKeyLabel(data.current.month, 'short');
    const compareLabel = formatMonthKeyLabel(data.compare.month, 'short');

    return {
      type: 'bar',
      data: {
        labels: ['Receitas', 'Despesas', 'Saldo'],
        datasets: [
          {
            label: currentLabel,
            data: [data.current.incomeTotal, data.current.expenseTotal, data.current.balance],
            backgroundColor: [...COMPARISON_BAR_COLORS.current],
            borderRadius: 6,
          },
          {
            label: compareLabel,
            data: [data.compare.incomeTotal, data.compare.expenseTotal, data.compare.balance],
            backgroundColor: [...COMPARISON_BAR_COLORS.compare],
            borderColor: [...COMPARISON_BAR_COLORS.compareBorder],
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      },
      options: this.barOptions(theme),
    };
  });

  readonly expenseCategoryChart = computed<ChartConfiguration | null>(() => {
    this.themeService.theme();
    const theme = resolveChartTheme();
    const data = this.comparison();
    if (!data?.current.expensesByCategory.length) return null;
    const items = data.current.expensesByCategory.slice(0, 8);
    return {
      type: 'doughnut',
      data: {
        labels: items.map((i) => i.name),
        datasets: [
          {
            data: items.map((i) => i.total),
            backgroundColor: items.map((i) => i.color),
            borderWidth: 0,
          },
        ],
      },
      options: this.doughnutOptions(theme),
    };
  });

  readonly showComparison = computed(() => this.compareMode() !== 'none');

  ngOnInit(): void {
    this.load();
  }

  onPeriodChange(value: string): void {
    this.periodInput.set(value);
    if (this.compareMode() === 'previous') {
      const parts = partsFromMonthInput(value);
      if (parts) {
        const prev = previousMonth(parts.month, parts.year);
        this.comparePeriodInput.set(monthInputFromParts(prev.month, prev.year));
      }
    }
    this.load();
  }

  onCompareModeChange(value: CompareMode): void {
    this.compareMode.set(value);
    if (value === 'previous') {
      const parts = partsFromMonthInput(this.periodInput());
      if (parts) {
        const prev = previousMonth(parts.month, parts.year);
        this.comparePeriodInput.set(monthInputFromParts(prev.month, prev.year));
      }
    }
    this.load();
  }

  onComparePeriodChange(value: string): void {
    this.comparePeriodInput.set(value);
    this.load();
  }

  load(): void {
    const parts = partsFromMonthInput(this.periodInput());
    if (!parts) return;

    this.loading.set(true);

    const compareParams =
      this.compareMode() === 'none'
        ? null
        : this.compareMode() === 'custom'
          ? partsFromMonthInput(this.comparePeriodInput())
          : previousMonth(parts.month, parts.year);

    const compareRequest =
      compareParams == null
        ? this.analytics.getCompare({ month: parts.month, year: parts.year })
        : this.analytics.getCompare({
            month: parts.month,
            year: parts.year,
            compareMonth: compareParams.month,
            compareYear: compareParams.year,
          });

    forkJoin({
      evolution: this.analytics.getEvolution(12),
      comparison: compareRequest,
      dashboard: this.analytics.getDashboard({ month: parts.month, year: parts.year }),
    }).subscribe({
      next: ({ evolution, comparison, dashboard }) => {
        this.evolution.set(evolution);
        this.comparison.set(comparison);
        this.dashboard.set(dashboard);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private placeholderCards(): SummaryCardData[] {
    const dash = '—';
    return [
      { title: 'Receitas', value: dash, icon: TrendingUp, change: dash, type: 'neutral' },
      { title: 'Despesas', value: dash, icon: TrendingDown, change: dash, type: 'neutral' },
      {
        title: 'Saldo',
        value: dash,
        icon: Wallet,
        change: dash,
        type: 'neutral',
        highlight: true,
      },
    ];
  }

  private lineOptions(theme: ChartThemeColors): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        title: { display: false },
        legend: { position: 'bottom', labels: { color: theme.text, boxWidth: 12 } },
        tooltip: {
          ...this.tooltipOptions(theme),
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatBrl(Number(ctx.raw))}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: theme.grid },
          ticks: { color: theme.text, maxRotation: 0 },
        },
        y: {
          grid: { color: theme.grid },
          ticks: {
            color: theme.text,
            callback: (v) => formatBrl(Number(v)),
          },
        },
      },
    };
  }

  private barOptions(theme: ChartThemeColors): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: theme.text, boxWidth: 12 } },
        tooltip: {
          ...this.tooltipOptions(theme),
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatBrl(Number(ctx.raw))}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: theme.text } },
        y: {
          grid: { color: theme.grid },
          ticks: {
            color: theme.text,
            callback: (v) => formatBrl(Number(v)),
          },
        },
      },
    };
  }

  private doughnutOptions(theme: ChartThemeColors): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: theme.text, boxWidth: 12 } },
        tooltip: {
          ...this.tooltipOptions(theme),
          callbacks: {
            label: (ctx) => {
              const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
              const value = Number(ctx.raw);
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${ctx.label}: ${formatBrl(value)} (${pct}%)`;
            },
          },
        },
      },
    };
  }

  private tooltipOptions(theme: ChartThemeColors) {
    return {
      backgroundColor: theme.tooltipBg,
      titleColor: theme.tooltipText,
      bodyColor: theme.tooltipText,
      borderColor: theme.tooltipBorder,
      borderWidth: 1,
    };
  }

  protected formatBrl = formatBrl;
  protected formatPeriodComparisonDelta = formatPeriodComparisonDelta;
  protected readonly arrowLeftIcon = ArrowLeft;
}
