import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, timeout } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { OHLCCandle, Timeframe } from '../models/candle.model';
import { PriceQuote } from '../models/currency-pair.model';

interface TwelveDataPrice { price: string; }
interface TwelveDataSeries {
  values?: Array<{ datetime: string; open: string; high: string; low: string; close: string; }>;
  status?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ForexApiService {
  private base = environment.twelveDataBaseUrl;
  private key  = environment.twelveDataApiKey;

  constructor(private http: HttpClient) {}

  /** Fetch latest price for a symbol. Completes with null on failure. */
  fetchPrice(symbol: string): Observable<PriceQuote> {
    const params = new HttpParams()
      .set('symbol', symbol)
      .set('apikey', this.key);

    return this.http.get<TwelveDataPrice>(`${this.base}/price`, { params }).pipe(
      timeout(6000),
      map(res => {
        const mid = parseFloat(res.price);
        return {
          symbol, mid,
          bid: mid,
          ask: mid,
          change: 0,
          changePercent: 0,
          timestamp: Date.now(),
          direction: 'neutral' as const,
        };
      }),
      catchError(err => throwError(() => err)),
    );
  }

  /** Fetch historical OHLC candles. */
  fetchCandles(symbol: string, timeframe: Timeframe, outputsize = 200): Observable<OHLCCandle[]> {
    const params = new HttpParams()
      .set('symbol', symbol)
      .set('interval', timeframe)
      .set('outputsize', String(outputsize))
      .set('apikey', this.key);

    return this.http.get<TwelveDataSeries>(`${this.base}/time_series`, { params }).pipe(
      timeout(10000),
      map(res => {
        if (res.status === 'error' || !res.values?.length) {
          throw new Error(res.message ?? 'No data');
        }
        return res.values!.map(v => ({
          time:  Math.floor(new Date(v.datetime).getTime() / 1000),
          open:  parseFloat(v.open),
          high:  parseFloat(v.high),
          low:   parseFloat(v.low),
          close: parseFloat(v.close),
        })).sort((a, b) => a.time - b.time);
      }),
      catchError(err => throwError(() => err)),
    );
  }
}
