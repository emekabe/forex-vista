import { CurrencyPair } from './currency-pair.model';

export const BASE_PRICES: Record<string, number> = {
  'EUR/USD': 1.0852,
  'GBP/USD': 1.2654,
  'USD/JPY': 151.42,
  'USD/CHF': 0.9048,
  'AUD/USD': 0.6552,
  'USD/CAD': 1.3598,
  'NZD/USD': 0.5948,
  'EUR/GBP': 0.8578,
  'EUR/JPY': 164.32,
  'GBP/JPY': 191.64,
};

export const CURRENCY_PAIRS: CurrencyPair[] = [
  { symbol: 'EUR/USD', base: 'EUR', quote: 'USD', name: 'Euro / US Dollar',         spread: 0.0002, pipSize: 0.0001, minLot: 0.01, maxLot: 100, volatility: 0.00030 },
  { symbol: 'GBP/USD', base: 'GBP', quote: 'USD', name: 'British Pound / US Dollar', spread: 0.0003, pipSize: 0.0001, minLot: 0.01, maxLot: 100, volatility: 0.00040 },
  { symbol: 'USD/JPY', base: 'USD', quote: 'JPY', name: 'US Dollar / Japanese Yen',  spread: 0.030,  pipSize: 0.01,   minLot: 0.01, maxLot: 100, volatility: 0.04000 },
  { symbol: 'USD/CHF', base: 'USD', quote: 'CHF', name: 'US Dollar / Swiss Franc',   spread: 0.0003, pipSize: 0.0001, minLot: 0.01, maxLot: 100, volatility: 0.00035 },
  { symbol: 'AUD/USD', base: 'AUD', quote: 'USD', name: 'Australian Dollar / US Dollar', spread: 0.0003, pipSize: 0.0001, minLot: 0.01, maxLot: 100, volatility: 0.00035 },
  { symbol: 'USD/CAD', base: 'USD', quote: 'CAD', name: 'US Dollar / Canadian Dollar', spread: 0.0003, pipSize: 0.0001, minLot: 0.01, maxLot: 100, volatility: 0.00030 },
  { symbol: 'NZD/USD', base: 'NZD', quote: 'USD', name: 'New Zealand Dollar / US Dollar', spread: 0.0004, pipSize: 0.0001, minLot: 0.01, maxLot: 100, volatility: 0.00040 },
  { symbol: 'EUR/GBP', base: 'EUR', quote: 'GBP', name: 'Euro / British Pound',      spread: 0.0003, pipSize: 0.0001, minLot: 0.01, maxLot: 100, volatility: 0.00020 },
  { symbol: 'EUR/JPY', base: 'EUR', quote: 'JPY', name: 'Euro / Japanese Yen',       spread: 0.040,  pipSize: 0.01,   minLot: 0.01, maxLot: 100, volatility: 0.05000 },
  { symbol: 'GBP/JPY', base: 'GBP', quote: 'JPY', name: 'British Pound / Japanese Yen', spread: 0.060, pipSize: 0.01, minLot: 0.01, maxLot: 100, volatility: 0.06000 },
];

export const LEVERAGE_OPTIONS = [1, 10, 25, 50, 100, 200];

export const LOT_SIZES = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0];

export const DEFAULT_PAIR = 'EUR/USD';

export function getPair(symbol: string): CurrencyPair {
  return CURRENCY_PAIRS.find(p => p.symbol === symbol) ?? CURRENCY_PAIRS[0];
}

export function isJpyPair(symbol: string): boolean {
  return symbol.includes('JPY');
}
