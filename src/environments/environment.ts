import { API_KEY } from './environment.key';

export const environment = {
  production: false,
  twelveDataApiKey: API_KEY,
  twelveDataBaseUrl: 'https://api.twelvedata.com',
  useMock: false,
  startingBalance: 10000,
  priceUpdateIntervalMs: 2000,
  liveUpdateIntervalMs: 10000,
};

