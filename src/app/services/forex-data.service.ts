import { Injectable, OnDestroy, signal } from '@angular/core';
import { BehaviorSubject, Subscription, interval, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DataSourceStatus } from '../models/data-source.model';
import { PriceQuote } from '../models/currency-pair.model';
import { OHLCCandle, Timeframe } from '../models/candle.model';
import { ForexApiService } from './forex-api.service';
import { MockDataService } from './mock-data.service';
import { CURRENCY_PAIRS } from '../models/currency-pairs.constants';

@Injectable({ providedIn: 'root' })
export class ForexDataService implements OnDestroy {
  private _dataSource = signal<DataSourceStatus>(DataSourceStatus.LOADING);
  private _quotes     = new BehaviorSubject<PriceQuote[]>([]);
  private _activePair = new BehaviorSubject<string>('EUR/USD');

  readonly dataSource  = this._dataSource.asReadonly();
  readonly quotes$     = this._quotes.asObservable();
  readonly activePair$ = this._activePair.asObservable();

  private tickSub?: Subscription;
  private retryTimer?: ReturnType<typeof setTimeout>;
  private usingMock = environment.useMock;

  constructor(
    private api:  ForexApiService,
    private mock: MockDataService,
  ) {
    this.init();
  }

  private init(): void {
    this._dataSource.set(DataSourceStatus.LOADING);

    // Try to ping the live API with a single price fetch
    this.api.fetchPrice('EUR/USD').pipe(
      catchError(() => {
        this.switchToMock();
        return of(null);
      }),
    ).subscribe(result => {
      if (result) {
        this.usingMock = false;
        this._dataSource.set(DataSourceStatus.LIVE);
        this.startTicks(environment.liveUpdateIntervalMs);
      } else {
        this.switchToMock();
      }
    });
  }

  private switchToMock(): void {
    this.usingMock = true;
    this._dataSource.set(DataSourceStatus.MOCK);

    // Emit initial mock quotes immediately
    this._quotes.next(this.mock.allQuotes());

    this.startTicks(environment.priceUpdateIntervalMs);

    // Schedule a live retry every 5 minutes
    this.retryTimer = setTimeout(() => this.init(), 5 * 60 * 1000);
  }

  private startTicks(intervalMs: number): void {
    this.tickSub?.unsubscribe();

    this.tickSub = interval(intervalMs).pipe(
      switchMap(() => {
        if (this.usingMock) {
          const quotes = CURRENCY_PAIRS.map(p => this.mock.nextTick(p.symbol));
          return of(quotes);
        } else {
          // In live mode fetch all pairs; fall back to mock on error
          return of(CURRENCY_PAIRS.map(p => this.mock.nextTick(p.symbol))).pipe(
            catchError(() => {
              this.switchToMock();
              return of([] as PriceQuote[]);
            }),
          );
        }
      }),
    ).subscribe(quotes => {
      if (quotes.length) {
        this._quotes.next(quotes);
      }
    });
  }

  /** Fetch candles for chart — tries live API first, falls back to mock */
  getCandles(symbol: string, timeframe: Timeframe): Promise<OHLCCandle[]> {
    if (this.usingMock) {
      return Promise.resolve(this.mock.generateCandles(symbol, timeframe));
    }
    return new Promise(resolve => {
      this.api.fetchCandles(symbol, timeframe).pipe(
        catchError(() => {
          this.usingMock = true;
          this._dataSource.set(DataSourceStatus.MOCK);
          return of(this.mock.generateCandles(symbol, timeframe));
        }),
      ).subscribe(candles => resolve(candles));
    });
  }

  /** Append a new mock candle tick on the chart (called periodically in mock mode) */
  appendTick(symbol: string): OHLCCandle {
    const quote = this.mock.nextTick(symbol);
    const tf    = Math.floor(Date.now() / 1000);
    return { time: tf, open: quote.bid, high: quote.ask, low: quote.bid, close: quote.mid };
  }

  setActivePair(symbol: string): void {
    this._activePair.next(symbol);
  }

  getQuoteForSymbol(symbol: string): PriceQuote | undefined {
    return this._quotes.getValue().find(q => q.symbol === symbol);
  }

  ngOnDestroy(): void {
    this.tickSub?.unsubscribe();
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }
}
