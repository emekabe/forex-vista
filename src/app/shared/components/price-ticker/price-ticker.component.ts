import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ForexDataService } from '../../../services/forex-data.service';
import { PriceQuote } from '../../../models/currency-pair.model';

@Component({
  selector: 'app-price-ticker',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="ticker-wrapper">
      <div class="ticker-track">
        @for (q of allQuotes; track q.symbol) {
          <div class="ticker-item" [class.up]="q.direction === 'up'" [class.down]="q.direction === 'down'">
            <span class="ticker-symbol">{{ q.symbol }}</span>
            <span class="ticker-price mono">{{ q.mid | number:'1.4-5' }}</span>
            <span class="ticker-change" [class.profit]="q.changePercent >= 0" [class.loss]="q.changePercent < 0">
              {{ q.changePercent >= 0 ? '+' : '' }}{{ q.changePercent | number:'1.2-2' }}%
            </span>
          </div>
        }
        <!-- Duplicate for seamless loop -->
        @for (q of allQuotes; track 'dup-' + q.symbol) {
          <div class="ticker-item" [class.up]="q.direction === 'up'" [class.down]="q.direction === 'down'">
            <span class="ticker-symbol">{{ q.symbol }}</span>
            <span class="ticker-price mono">{{ q.mid | number:'1.4-5' }}</span>
            <span class="ticker-change" [class.profit]="q.changePercent >= 0" [class.loss]="q.changePercent < 0">
              {{ q.changePercent >= 0 ? '+' : '' }}{{ q.changePercent | number:'1.2-2' }}%
            </span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .ticker-wrapper {
      height: var(--ticker-height);
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      overflow: hidden;
      position: relative;
    }
    .ticker-track {
      display: flex;
      align-items: center;
      height: 100%;
      white-space: nowrap;
      animation: ticker-scroll 40s linear infinite;
      width: max-content;
    }
    .ticker-track:hover { animation-play-state: paused; }
    .ticker-item {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1.5rem;
      border-right: 1px solid var(--border-color);
      height: 100%;
      transition: background var(--t-fast);
      cursor: default;
    }
    .ticker-item:hover { background: var(--bg-tertiary); }
    .ticker-symbol { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em; }
    .ticker-price  { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
    .ticker-change { font-size: 0.72rem; font-weight: 600; }
  `],
})
export class PriceTickerComponent implements OnInit, OnDestroy {
  private dataFeed = inject(ForexDataService);
  private sub?: Subscription;
  allQuotes: PriceQuote[] = [];

  ngOnInit(): void {
    this.sub = this.dataFeed.quotes$.subscribe(quotes => {
      this.allQuotes = quotes;
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
