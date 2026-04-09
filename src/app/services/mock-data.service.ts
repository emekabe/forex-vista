import { Injectable } from '@angular/core';
import { OHLCCandle, Timeframe, TIMEFRAME_OPTIONS } from '../models/candle.model';
import { PriceQuote } from '../models/currency-pair.model';
import { BASE_PRICES, CURRENCY_PAIRS, getPair } from '../models/currency-pairs.constants';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  // Maintain running prices per symbol so ticks are continuous
  private currentPrices: Record<string, number> = { ...BASE_PRICES };
  private prevPrices:    Record<string, number> = { ...BASE_PRICES };

  /** Generate historical OHLC candles using a random walk */
  generateCandles(symbol: string, timeframe: Timeframe, count = 200): OHLCCandle[] {
    const tf = TIMEFRAME_OPTIONS.find(t => t.value === timeframe)!;
    const pair  = getPair(symbol);
    const vol   = pair.volatility;

    let price   = BASE_PRICES[symbol] ?? 1.2;
    const now   = Math.floor(Date.now() / 1000);
    const start = now - count * tf.seconds;
    const candles: OHLCCandle[] = [];

    for (let i = 0; i < count; i++) {
      const open = price;
      const moves = [this.gauss() * vol, this.gauss() * vol, this.gauss() * vol, this.gauss() * vol];
      const close = open * (1 + moves[3]);
      const highMult = 1 + Math.abs(Math.max(...moves));
      const lowMult  = 1 - Math.abs(Math.min(...moves));

      candles.push({
        time:  start + i * tf.seconds,
        open:  this.round(open, pair),
        high:  this.round(open * highMult, pair),
        low:   this.round(open * lowMult, pair),
        close: this.round(close, pair),
      });
      price = close;
    }

    // Store last generated price as current
    this.currentPrices[symbol] = price;
    return candles;
  }

  /** Advance price by one tick and return a new quote */
  nextTick(symbol: string): PriceQuote {
    const pair  = getPair(symbol);
    const prev  = this.currentPrices[symbol] ?? BASE_PRICES[symbol] ?? 1.2;
    const move  = this.gauss() * pair.volatility;

    // Occasional spike (0.5% chance)
    const spike = Math.random() < 0.005 ? this.gauss() * pair.volatility * 4 : 0;
    const mid   = this.round(prev * (1 + move + spike), pair);

    this.prevPrices[symbol]    = prev;
    this.currentPrices[symbol] = mid;

    const change        = mid - (this.prevPrices[symbol] ?? mid);
    const changePercent = (change / (this.prevPrices[symbol] ?? mid)) * 100;

    return {
      symbol,
      bid: this.round(mid - pair.spread / 2, pair),
      ask: this.round(mid + pair.spread / 2, pair),
      mid,
      change,
      changePercent,
      timestamp: Date.now(),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  }

  /** Get snapshot quotes for all pairs */
  allQuotes(): PriceQuote[] {
    return CURRENCY_PAIRS.map(p => this.nextTick(p.symbol));
  }

  /** Get current mid price for a symbol (no tick advance) */
  currentPrice(symbol: string): number {
    return this.currentPrices[symbol] ?? BASE_PRICES[symbol] ?? 1.0;
  }

  // Box-Muller transform for normally distributed random numbers
  private gauss(): number {
    const u = Math.max(1e-10, Math.random());
    const v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  private round(price: number, pair: { pipSize: number }): number {
    const decimals = pair.pipSize >= 0.01 ? 3 : 5;
    return +price.toFixed(decimals);
  }
}
