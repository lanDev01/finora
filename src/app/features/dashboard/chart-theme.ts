/** Cores resolvidas para Chart.js (canvas não entende var(--*) nem color-mix). */
export interface ChartThemeColors {
  text: string;
  grid: string;
  compareBar: string;
  tooltipBg: string;
  tooltipText: string;
  tooltipBorder: string;
}

export const CHART_SERIES_COLORS = {
  income: '#67c090',
  expense: '#f87171',
  balance: '#4b70f5',
  incomeFill: 'rgba(103, 192, 144, 0.18)',
  expenseFill: 'rgba(248, 113, 113, 0.15)',
} as const;

function resolvedCssColor(token: string, property: 'color' | 'backgroundColor' | 'borderColor'): string {
  const el = document.createElement('span');
  el.style.setProperty(property, `var(${token})`);
  document.body.appendChild(el);
  const value = getComputedStyle(el)[property];
  el.remove();
  return value || '#a3a3a3';
}

function toRgba(rgb: string, alpha: number): string {
  const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(rgb);
  if (!match) return rgb;
  return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
}

export function resolveChartTheme(): ChartThemeColors {
  const text = resolvedCssColor('--foreground-muted', 'color');
  const foreground = resolvedCssColor('--foreground', 'color');
  const border = resolvedCssColor('--border', 'borderColor');
  const card = resolvedCssColor('--card', 'backgroundColor');

  return {
    text,
    grid: toRgba(border, 0.45),
    compareBar: toRgba(foreground, 0.28),
    tooltipBg: card,
    tooltipText: foreground,
    tooltipBorder: border,
  };
}
