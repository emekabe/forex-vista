import { Component, inject, signal, computed } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../../services/portfolio.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { Trade } from '../../models/trade.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [DecimalPipe, DatePipe, FormsModule, RouterLink, StatCardComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent {
  protected portfolio = inject(PortfolioService);

  filterDir  = signal<'ALL' | 'BUY' | 'SELL'>('ALL');
  filterSymb = signal('ALL');
  sortField  = signal<'closeTime' | 'pnl' | 'lots'>('closeTime');
  sortAsc    = signal(false);

  get stats() { return this.portfolio.stats(); }

  allSymbols = computed(() => {
    const syms = new Set(this.portfolio.closedTrades().map(t => t.symbol));
    return ['ALL', ...Array.from(syms)];
  });

  filtered = computed<Trade[]>(() => {
    let trades = [...this.portfolio.closedTrades()];

    if (this.filterDir() !== 'ALL')  trades = trades.filter(t => t.direction === this.filterDir());
    if (this.filterSymb() !== 'ALL') trades = trades.filter(t => t.symbol === this.filterSymb());

    const field = this.sortField();
    trades.sort((a, b) => {
      const va = a[field] ?? 0;
      const vb = b[field] ?? 0;
      return this.sortAsc() ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1);
    });
    return trades;
  });

  sort(field: 'closeTime' | 'pnl' | 'lots'): void {
    if (this.sortField() === field) this.sortAsc.update(v => !v);
    else { this.sortField.set(field); this.sortAsc.set(false); }
  }

  reset(): void {
    if (confirm('Reset your account? All trades and balance will be cleared.')) {
      this.portfolio.resetAccount();
    }
  }
}
