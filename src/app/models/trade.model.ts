export type TradeDirection = 'BUY' | 'SELL';
export type TradeStatus = 'OPEN' | 'CLOSED';

export interface Trade {
  id: string;
  symbol: string;
  direction: TradeDirection;
  lots: number;
  leverage: number;
  openPrice: number;
  closePrice?: number;
  openTime: number;
  closeTime?: number;
  stopLoss?: number;
  takeProfit?: number;
  status: TradeStatus;
  pnl: number;
  pipsPnl: number;
  marginUsed: number;
}

export interface OrderRequest {
  symbol: string;
  direction: TradeDirection;
  lots: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
}
