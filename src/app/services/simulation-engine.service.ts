import { Injectable } from '@angular/core';
import { Trade, OrderRequest, TradeDirection } from '../models/trade.model';
import { getPair, isJpyPair } from '../models/currency-pairs.constants';

const PIP_VALUE_USD = 10;    // $10 per pip per standard lot (major USD pairs)
const PIP_VALUE_JPY = 6.50;  // approx $6.50 per pip per standard lot (JPY pairs)
const UNITS_PER_LOT = 100_000;

@Injectable({ providedIn: 'root' })
export class SimulationEngineService {

  /** Execute a new order and return the created Trade */
  openTrade(order: OrderRequest, currentPrice: number, balance: number): {
    trade: Trade | null;
    error: string | null;
  } {
    const pair = getPair(order.symbol);

    // Open at ASK for BUY, BID for SELL
    const spread = pair.spread;
    const openPrice = order.direction === 'BUY'
      ? currentPrice + spread / 2
      : currentPrice - spread / 2;

    const margin = this.calcMargin(order.symbol, order.lots, currentPrice, order.leverage);

    if (margin > balance) {
      return { trade: null, error: 'Insufficient margin. Reduce lot size or increase leverage.' };
    }

    const trade: Trade = {
      id:         `trade_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      symbol:     order.symbol,
      direction:  order.direction,
      lots:       order.lots,
      leverage:   order.leverage,
      openPrice,
      openTime:   Date.now(),
      stopLoss:   order.stopLoss,
      takeProfit: order.takeProfit,
      status:     'OPEN',
      pnl:        0,
      pipsPnl:    0,
      marginUsed: margin,
    };

    return { trade, error: null };
  }

  /** Close an open trade at current market price */
  closeTrade(trade: Trade, currentPrice: number): Trade {
    const closePrice = trade.direction === 'BUY'
      ? currentPrice - getPair(trade.symbol).spread / 2   // close BUY at BID
      : currentPrice + getPair(trade.symbol).spread / 2;  // close SELL at ASK

    const { pnl, pipsPnl } = this.calcPnl(trade, closePrice);

    return {
      ...trade,
      closePrice,
      closeTime: Date.now(),
      status:    'CLOSED',
      pnl,
      pipsPnl,
    };
  }

  /** Calculate unrealised P&L for an open trade */
  calcPnl(trade: Trade, currentPrice: number): { pnl: number; pipsPnl: number } {
    const pair  = getPair(trade.symbol);
    const dir   = trade.direction === 'BUY' ? 1 : -1;
    const priceDiff = (currentPrice - trade.openPrice) * dir;
    const pipsPnl   = priceDiff / pair.pipSize;
    const pipVal    = isJpyPair(trade.symbol) ? PIP_VALUE_JPY : PIP_VALUE_USD;
    const pnl       = pipsPnl * pipVal * trade.lots;

    return { pnl: +pnl.toFixed(2), pipsPnl: +pipsPnl.toFixed(1) };
  }

  /** Calculate margin required (always in USD equivalent) */
  calcMargin(symbol: string, lots: number, price: number, leverage: number): number {
    const notional = lots * UNITS_PER_LOT * price;
    return +(notional / leverage).toFixed(2);
  }

  /** Check if stop-loss or take-profit has been triggered */
  checkSLTP(trade: Trade, currentPrice: number): 'sl' | 'tp' | null {
    if (!trade.stopLoss && !trade.takeProfit) return null;

    if (trade.direction === 'BUY') {
      if (trade.stopLoss   && currentPrice <= trade.stopLoss)   return 'sl';
      if (trade.takeProfit && currentPrice >= trade.takeProfit) return 'tp';
    } else {
      if (trade.stopLoss   && currentPrice >= trade.stopLoss)   return 'sl';
      if (trade.takeProfit && currentPrice <= trade.takeProfit) return 'tp';
    }
    return null;
  }

  /** Calculate margin level percentage */
  marginLevel(equity: number, marginUsed: number): number {
    if (marginUsed === 0) return Infinity;
    return +(equity / marginUsed * 100).toFixed(1);
  }

  /** Format price to correct decimal places for symbol */
  formatPrice(symbol: string, price: number): string {
    const pair = getPair(symbol);
    const decimals = pair.pipSize >= 0.01 ? 3 : 5;
    return price.toFixed(decimals);
  }

  /** Calculate pip difference between two prices */
  pips(symbol: string, priceA: number, priceB: number): number {
    const pair = getPair(symbol);
    return +((priceA - priceB) / pair.pipSize).toFixed(1);
  }
}
