import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [],
  template: `
    <div class="stat-card" [class.positive]="highlight === 'positive'" [class.negative]="highlight === 'negative'">
      <div class="stat-header">
        <span class="stat-label">{{ label }}</span>
        @if (iconPath) {
          <div class="stat-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 [innerHTML]="iconPath"></svg>
          </div>
        }
      </div>
      <div class="stat-value mono" [class.profit]="highlight === 'positive'" [class.loss]="highlight === 'negative'">
        @if (prefix) { <span class="stat-prefix">{{ prefix }}</span> }
        <span>{{ displayValue }}</span>
        @if (suffix) { <span class="stat-suffix">{{ suffix }}</span> }
      </div>
      @if (sublabel) {
        <div class="stat-sublabel">{{ sublabel }}</div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .stat-card {
      background: var(--surface-1);
      border: 1px solid var(--border-color);
      border-radius: var(--r-lg);
      padding: 1.25rem 1.5rem;
      height: 100%;
      box-sizing: border-box;
      transition: border-color var(--t-normal), box-shadow var(--t-normal), transform var(--t-normal);
      position: relative;
      overflow: hidden;
    }
    .stat-card::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0;
      transition: opacity var(--t-normal);
      pointer-events: none;
    }
    .stat-card:hover { border-color: var(--border-light); transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .stat-card.positive { border-left: 3px solid var(--accent-green); }
    .stat-card.positive::after { background: linear-gradient(135deg, var(--accent-green-dim), transparent 60%); opacity:1; }
    .stat-card.negative { border-left: 3px solid var(--accent-red); }
    .stat-card.negative::after { background: linear-gradient(135deg, var(--accent-red-dim), transparent 60%); opacity:1; }
    .stat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.625rem; }
    .stat-label   { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
    .stat-icon    { width: 28px; height: 28px; background: var(--bg-tertiary); border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
    .stat-value   { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); line-height: 1.1; display: flex; align-items: baseline; gap: 0.15rem; }
    .stat-prefix  { font-size: 1rem; opacity: 0.7; }
    .stat-suffix  { font-size: 1rem; opacity: 0.7; margin-left: 0.1rem; }
    .stat-sublabel { font-size: 0.73rem; color: var(--text-muted); margin-top: 0.375rem; }
  `],
})
export class StatCardComponent implements OnChanges {
  @Input() label     = '';
  @Input() value: string | number = 0;
  @Input() prefix    = '';
  @Input() suffix    = '';
  @Input() sublabel  = '';
  @Input() iconPath  = '';
  @Input() decimals  = 2;
  @Input() highlight: 'positive' | 'negative' | 'none' = 'none';

  displayValue = '';

  ngOnChanges(): void {
    this.displayValue = this.format();
  }

  private format(): string {
    if (typeof this.value === 'number') {
      const abs = Math.abs(this.value);
      return abs.toLocaleString('en-US', {
        minimumFractionDigits: this.decimals,
        maximumFractionDigits: this.decimals,
      });
    }
    return this.value || '—';
  }
}

