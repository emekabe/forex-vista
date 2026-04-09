export enum DataSourceStatus {
  LOADING = 'LOADING',
  LIVE = 'LIVE',
  MOCK = 'MOCK',
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}
