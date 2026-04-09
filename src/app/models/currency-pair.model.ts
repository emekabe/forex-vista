export interface CurrencyPair {
  symbol: string;
  base: string;
  quote: string;
  name: string;
  spread: number;
  pipSize: number;
  minLot: number;
  maxLot: number;
  volatility: number;
  flag?: string;
}

export interface PriceQuote {
  symbol: string;
  bid: number;
  ask: number;
  mid: number;
  change: number;
  changePercent: number;
  timestamp: number;
  direction?: 'up' | 'down' | 'neutral';
}
