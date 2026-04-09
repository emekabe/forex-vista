import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  protected portfolio = inject(PortfolioService);

  get port() { return this.portfolio.portfolio(); }
  get stats() { return this.portfolio.stats(); }
  get openTrades() { return this.portfolio.openTrades(); }
  get recentTrades() { return this.portfolio.closedTrades().slice(0, 8); }

  pnlHighlight(pnl: number): 'positive' | 'negative' | 'none' {
    return pnl > 0 ? 'positive' : pnl < 0 ? 'negative' : 'none';
  }
}
