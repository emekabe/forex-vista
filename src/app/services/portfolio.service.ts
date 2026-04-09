import { Injectable, OnDestroy, computed, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { Trade, OrderRequest } from '../models/trade.model';
import { Portfolio, AccountStats, AccountState } from '../models/portfolio.model';
import { LocalStorageService } from './local-storage.service';
import { SimulationEngineService } from './simulation-engine.service';
import { ForexDataService } from './forex-data.service';
import { NotificationService } from './notification.service';

const KEYS = {
  ACCOUNT:  'fv_account',
  TRADES:   'fv_trades',
  OPEN:     'fv_open_trades',
};

const DEFAULT_BALANCE = environment.startingBalance;

@Injectable({ providedIn: 'root' })
export class PortfolioService implements OnDestroy {
  private _account    = signal<AccountState>({ balance: DEFAULT_BALANCE, initialBalance: DEFAULT_BALANCE });
  private _openTrades = signal<Trade[]>([]);
  private _closedTrades = signal<Trade[]>([]);
  private quoteSub?: Subscription;

  readonly account      = this._account.asReadonly();
  readonly openTrades   = this._openTrades.asReadonly();
  readonly closedTrades = this._closedTrades.asReadonly();

  readonly portfolio = computed<Portfolio>(() => {
    const { balance } = this._account();
    const openPnl = this._openTrades().reduce((sum, t) => sum + t.pnl, 0);
    const equity  = balance + openPnl;
    const margin  = this._openTrades().reduce((sum, t) => sum + t.marginUsed, 0);
    const freeMargin = equity - margin;
    const marginLevel = margin > 0 ? (equity / margin) * 100 : 0;
    return { balance, equity, margin, freeMargin, marginLevel, openPnl };
  });

  readonly stats = computed<AccountStats>(() => {
    const closed = this._closedTrades();
    if (!closed.length) {
      return { totalTrades: 0, winningTrades: 0, losingTrades: 0, winRate: 0,
               totalPnl: 0, bestTrade: 0, worstTrade: 0, averagePnl: 0 };
    }
    const wins   = closed.filter(t => t.pnl > 0);
    const losses = closed.filter(t => t.pnl < 0);
    const totalPnl = closed.reduce((s, t) => s + t.pnl, 0);
    return {
      totalTrades:   closed.length,
      winningTrades: wins.length,
      losingTrades:  losses.length,
      winRate:       +(wins.length / closed.length * 100).toFixed(1),
      totalPnl:      +totalPnl.toFixed(2),
      bestTrade:     Math.max(...closed.map(t => t.pnl)),
      worstTrade:    Math.min(...closed.map(t => t.pnl)),
      averagePnl:    +(totalPnl / closed.length).toFixed(2),
    };
  });

  constructor(
    private storage: LocalStorageService,
    private engine:  SimulationEngineService,
    private data:    ForexDataService,
    private notif:   NotificationService,
  ) {
    this.loadFromStorage();
    this.subscribeToPrices();
  }

  openTrade(order: OrderRequest): boolean {
    const quote  = this.data.getQuoteForSymbol(order.symbol);
    const price  = quote?.mid ?? 1.0;
    const result = this.engine.openTrade(order, price, this._account().balance);

    if (result.error) {
      this.notif.error('Trade Failed', result.error);
      return false;
    }

    this._openTrades.update(trades => [result.trade!, ...trades]);
    this.save();
    this.notif.success('Trade Opened',
      `${order.direction} ${order.lots} lot(s) ${order.symbol} @ ${this.engine.formatPrice(order.symbol, result.trade!.openPrice)}`
    );
    return true;
  }

  closeTrade(tradeId: string): void {
    const trade = this._openTrades().find(t => t.id === tradeId);
    if (!trade) return;

    const quote  = this.data.getQuoteForSymbol(trade.symbol);
    const price  = quote?.mid ?? trade.openPrice;
    const closed = this.engine.closeTrade(trade, price);

    this._openTrades.update(ts => ts.filter(t => t.id !== tradeId));
    this._closedTrades.update(ts => [closed, ...ts]);
    this._account.update(a => ({ ...a, balance: +(a.balance + closed.pnl).toFixed(2) }));
    this.save();

    const sign = closed.pnl >= 0 ? '+' : '';
    const type = closed.pnl >= 0 ? 'success' : 'error';
    this.notif.show(type, 'Trade Closed',
      `${sign}$${closed.pnl.toFixed(2)} (${closed.pipsPnl > 0 ? '+' : ''}${closed.pipsPnl} pips)`
    );
  }

  resetAccount(): void {
    this._account.set({ balance: DEFAULT_BALANCE, initialBalance: DEFAULT_BALANCE });
    this._openTrades.set([]);
    this._closedTrades.set([]);
    this.save();
    this.notif.info('Account Reset', `Balance restored to $${DEFAULT_BALANCE.toLocaleString()}`);
  }

  private subscribeToPrices(): void {
    this.quoteSub = this.data.quotes$.subscribe(quotes => {
      const quoteMap: Record<string, number> = {};
      quotes.forEach(q => { quoteMap[q.symbol] = q.mid; });

      this._openTrades.update(trades =>
        trades.map(trade => {
          const price = quoteMap[trade.symbol];
          if (!price) return trade;

          // Check SL/TP
          const trigger = this.engine.checkSLTP(trade, price);
          if (trigger) {
            setTimeout(() => this.closeTrade(trade.id), 0);
            return trade;
          }

          const { pnl, pipsPnl } = this.engine.calcPnl(trade, price);
          return { ...trade, pnl, pipsPnl };
        })
      );
    });
  }

  private loadFromStorage(): void {
    const account = this.storage.get<AccountState>(KEYS.ACCOUNT, { balance: DEFAULT_BALANCE, initialBalance: DEFAULT_BALANCE });
    const open    = this.storage.get<Trade[]>(KEYS.OPEN, []);
    const closed  = this.storage.get<Trade[]>(KEYS.TRADES, []);
    this._account.set(account);
    this._openTrades.set(open);
    this._closedTrades.set(closed);
  }

  private save(): void {
    this.storage.set(KEYS.ACCOUNT,  this._account());
    this.storage.set(KEYS.OPEN,     this._openTrades());
    this.storage.set(KEYS.TRADES,   this._closedTrades());
  }

  ngOnDestroy(): void {
    this.quoteSub?.unsubscribe();
  }
}
