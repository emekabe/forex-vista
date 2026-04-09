export interface OHLCCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type Timeframe = '1min' | '5min' | '15min' | '1h' | '4h' | '1day';

export interface TimeframeOption {
  label: string;
  value: Timeframe;
  seconds: number;
}

export const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { label: '1M', value: '1min', seconds: 60 },
  { label: '5M', value: '5min', seconds: 300 },
  { label: '15M', value: '15min', seconds: 900 },
  { label: '1H', value: '1h', seconds: 3600 },
  { label: '4H', value: '4h', seconds: 14400 },
  { label: '1D', value: '1day', seconds: 86400 },
];
