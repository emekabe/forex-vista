import {
  Component, inject, OnInit, OnDestroy, signal, ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';

import { ForexDataService } from '../../services/forex-data.service';
import { PortfolioService } from '../../services/portfolio.service';
import { SimulationEngineService } from '../../services/simulation-engine.service';
import { NotificationService } from '../../services/notification.service';

import { CURRENCY_PAIRS, LEVERAGE_OPTIONS, DEFAULT_PAIR } from '../../models/currency-pairs.constants';
import { TIMEFRAME_OPTIONS, Timeframe } from '../../models/candle.model';
import { PriceQuote } from '../../models/currency-pair.model';
import { OrderRequest } from '../../models/trade.model';
import { Portfolio } from '../../models/portfolio.model';

import {
  createChart, IChartApi, ISeriesApi, ColorType, CrosshairMode, UTCTimestamp,
  CandlestickSeries
} from 'lightweight-charts';

@Component({
  selector: 'app-trading',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './trading.component.html',
  styleUrl: './trading.component.css',
})
export class TradingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartEl', { static: false }) chartEl!: ElementRef<HTMLDivElement>;

  private route     = inject(ActivatedRoute);
  private dataFeed  = inject(ForexDataService);
  private portfolioSvc = inject(PortfolioService);
  private engine    = inject(SimulationEngineService);
  private notif     = inject(NotificationService);

  // State signals
  selectedPair  = signal(DEFAULT_PAIR);
  selectedTf    = signal<Timeframe>('1min');
  lots          = signal(0.1);
  leverage      = signal(50);
  stopLoss      = signal<number | undefined>(undefined);
  takeProfit    = signal<number | undefined>(undefined);
  currentQuote  = signal<PriceQuote | null>(null);
  priceFlash    = signal<'up' | 'down' | null>(null);
  chartLoading  = signal(true);

  // Expose as signals so templates can use them easily
  get openTrades()  { return this.portfolioSvc.openTrades().filter(t => t.symbol === this.selectedPair()); }
  get portfolioSnap(): Portfolio { return this.portfolioSvc.portfolio(); }

  readonly pairs      = CURRENCY_PAIRS;
  readonly leverages  = LEVERAGE_OPTIONS;
  readonly timeframes = TIMEFRAME_OPTIONS;

  private chart?: IChartApi;
  private candleSeries?: ISeriesApi<'Candlestick'>;
  private quoteSub?: Subscription;
  private resizeObs?: ResizeObserver;

  ngOnInit(): void {
    const pairParam = this.route.snapshot.paramMap.get('pair');
    if (pairParam) {
      const decoded = decodeURIComponent(pairParam).toUpperCase();
      if (this.pairs.some(p => p.symbol === decoded)) {
        this.selectedPair.set(decoded);
      }
    }

    this.quoteSub = this.dataFeed.quotes$.subscribe(quotes => {
      const q = quotes.find(q => q.symbol === this.selectedPair());
      if (q) {
        const prev = this.currentQuote()?.mid ?? q.mid;
        if (q.mid > prev) this.flash('up');
        else if (q.mid < prev) this.flash('down');
        this.currentQuote.set(q);
        this.appendCandleTick(q);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  private async initChart(): Promise<void> {
    if (!this.chartEl) return;
    const el = this.chartEl.nativeElement;

    this.chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: '#111827' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      crosshair:       { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#1f2937' },
      timeScale:       { borderColor: '#1f2937', timeVisible: true, secondsVisible: false },
      width:  el.clientWidth,
      height: el.clientHeight || 400,
    });

    // lightweight-charts v5 API: addSeries(CandlestickSeries, options)
    this.candleSeries = this.chart.addSeries(CandlestickSeries, {
      upColor:         '#00d97e',
      downColor:       '#ff4757',
      borderUpColor:   '#00d97e',
      borderDownColor: '#ff4757',
      wickUpColor:     '#00d97e',
      wickDownColor:   '#ff4757',
    });

    this.resizeObs = new ResizeObserver(() => {
      this.chart?.applyOptions({ width: el.clientWidth });
    });
    this.resizeObs.observe(el);

    await this.loadCandles();
  }

  async loadCandles(): Promise<void> {
    this.chartLoading.set(true);
    const candles = await this.dataFeed.getCandles(this.selectedPair(), this.selectedTf());
    this.candleSeries?.setData(candles.map(c => ({
      time:  c.time as UTCTimestamp,
      open:  c.open,
      high:  c.high,
      low:   c.low,
      close: c.close,
    })));
    this.chart?.timeScale().fitContent();
    this.chartLoading.set(false);
  }

  private appendCandleTick(q: PriceQuote): void {
    if (!this.candleSeries) return;
    const time = Math.floor(Date.now() / 1000) as UTCTimestamp;
    this.candleSeries.update({ time, open: q.bid, high: q.ask, low: q.bid, close: q.mid });
  }

  selectPair(symbol: string): void {
    this.selectedPair.set(symbol);
    this.currentQuote.set(null);
    this.loadCandles();
  }

  selectTimeframe(tf: Timeframe): void {
    this.selectedTf.set(tf);
    this.loadCandles();
  }

  executeTrade(direction: 'BUY' | 'SELL'): void {
    const order: OrderRequest = {
      symbol:     this.selectedPair(),
      direction,
      lots:       this.lots(),
      leverage:   this.leverage(),
      stopLoss:   this.stopLoss(),
      takeProfit: this.takeProfit(),
    };
    this.portfolioSvc.openTrade(order);
  }

  closeTrade(id: string): void {
    this.portfolioSvc.closeTrade(id);
  }

  private flash(dir: 'up' | 'down'): void {
    this.priceFlash.set(dir);
    setTimeout(() => this.priceFlash.set(null), 700);
  }

  ngOnDestroy(): void {
    this.quoteSub?.unsubscribe();
    this.resizeObs?.disconnect();
    this.chart?.remove();
  }
}
