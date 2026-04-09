export interface Portfolio {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  openPnl: number;
}

export interface AccountStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnl: number;
  bestTrade: number;
  worstTrade: number;
  averagePnl: number;
}

export interface AccountState {
  balance: number;
  initialBalance: number;
}
