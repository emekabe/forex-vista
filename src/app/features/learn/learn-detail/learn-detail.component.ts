import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { inject } from '@angular/core';

interface TopicContent {
  title: string;
  icon: string;
  sections: Array<{ heading: string; body: string; tip?: string; }>;
}

const TOPICS: Record<string, TopicContent> = {
  'what-is-forex': {
    title: 'What is Forex?', icon: '🌍',
    sections: [
      { heading: 'The Foreign Exchange Market', body: 'Forex (Foreign Exchange) is the global marketplace for buying and selling currencies. It is the world\'s largest and most liquid financial market, with over $7.5 trillion USD traded every single day — dwarfing the stock market.', tip: 'Unlike stock markets, forex trades 24 hours a day, 5 days a week across major global centers: London, New York, Tokyo, and Sydney.' },
      { heading: 'Who Trades Forex?', body: 'Participants include central banks, commercial banks, hedge funds, multinational corporations, and retail traders like you. Retail traders access the market through brokers using leverage.' },
      { heading: 'How Prices Move', body: 'Currency prices are driven by supply and demand, which is influenced by economic data (inflation, employment, GDP), central bank policies, geopolitical events, and market sentiment.' },
    ],
  },
  'currency-pairs': {
    title: 'Currency Pairs', icon: '💱',
    sections: [
      { heading: 'What is a Currency Pair?', body: 'Currencies are always traded in pairs, e.g. EUR/USD. The first currency (EUR) is the base currency; the second (USD) is the quote currency. The price tells you how many quote units buy 1 unit of the base.', tip: 'EUR/USD = 1.0850 means 1 Euro costs 1.0850 US Dollars.' },
      { heading: 'Majors, Minors & Exotics', body: 'Major pairs involve the USD and have the tightest spreads: EUR/USD, GBP/USD, USD/JPY. Minor pairs don\'t include USD (e.g. EUR/GBP). Exotic pairs include emerging market currencies and have wider spreads.' },
      { heading: 'Bid and Ask', body: 'Every pair has two prices: the Bid (the price the broker buys from you) and the Ask (the price you buy at). The difference is the Spread — the broker\'s built-in fee.' },
    ],
  },
  'pips-and-spreads': {
    title: 'Pips & Spreads', icon: '📏',
    sections: [
      { heading: 'What is a Pip?', body: 'A pip (percentage in point) is the smallest standard price move in a currency pair. For most pairs it\'s 0.0001 (4th decimal place). For JPY pairs, it\'s 0.01 (2nd decimal place).', tip: 'EUR/USD moves from 1.0850 to 1.0851 = 1 pip movement.' },
      { heading: 'Pip Value', body: 'For a standard lot (100,000 units), 1 pip on EUR/USD is worth approximately $10 USD. For 0.1 lots (mini lot) it\'s $1. Knowing pip value is essential for calculating position size and risk.' },
      { heading: 'The Spread', body: 'The spread is the difference between the bid and ask price. It\'s how brokers make money. A tighter spread means lower trading costs. EUR/USD typically has a spread of 0.1–0.3 pips at major brokers.' },
    ],
  },
  'leverage-and-margin': {
    title: 'Leverage & Margin', icon: '⚡',
    sections: [
      { heading: 'What is Leverage?', body: 'Leverage lets you control a large position with a small amount of capital. With 1:100 leverage, you can control $100,000 with just $1,000 of your own money.', tip: 'Leverage is a double-edged sword: it amplifies both profits AND losses. Use it wisely.' },
      { heading: 'Margin Explained', body: 'Margin is the deposit required to open a leveraged position. If you open 1 lot EUR/USD ($108,500 notional) with 1:100 leverage, your margin requirement is $1,085.' },
      { heading: 'Margin Call & Stop Out', body: 'If your equity falls below your margin requirement, the broker issues a margin call. If it continues to fall to the stop-out level (typically 50% of margin), positions are automatically closed.' },
    ],
  },
  'reading-charts': {
    title: 'Reading Charts', icon: '📊',
    sections: [
      { heading: 'Candlestick Charts', body: 'Each candlestick shows the Open, High, Low, and Close (OHLC) for a time period. A green/white candle means price closed higher than it opened (bullish). A red/black candle means it closed lower (bearish).', tip: 'The thin lines above and below the candle body are called "wicks" or "shadows" — they show the price extremes for that period.' },
      { heading: 'Support & Resistance', body: 'Support is a price level where buying is strong enough to prevent further decline. Resistance is where selling pressure prevents further rises. When price breaks through these levels, it often makes a strong move.' },
      { heading: 'Key Chart Patterns', body: 'Common patterns include: Head & Shoulders (reversal), Double Top/Bottom (reversal), Bull/Bear Flag (continuation), and Triangles (breakout). These help predict where price might go next.' },
    ],
  },
  'risk-management': {
    title: 'Risk Management', icon: '🛡️',
    sections: [
      { heading: 'The 2% Rule', body: 'Never risk more than 2% of your account balance on a single trade. If you have $10,000, your maximum loss per trade should be $200. This ensures a losing streak won\'t wipe out your account.', tip: 'Even a string of 10 consecutive losses with the 2% rule leaves you with ~$8,171 — still tradeable.' },
      { heading: 'Stop Loss Orders', body: 'A stop loss automatically closes your position if price moves against you by a set amount. It\'s your safety net. Always set a stop loss before entering a trade. Never move it further away to avoid being stopped out.' },
      { heading: 'Risk/Reward Ratio', body: 'Aim for a minimum 1:2 risk/reward ratio — risk $1 to potentially gain $2. This means you can be wrong 40% of the time and still be profitable. Track your average R/R in your trade history.' },
    ],
  },
};

@Component({
  selector: 'app-learn-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './learn-detail.component.html',
  styleUrl: './learn-detail.component.css',
})
export class LearnDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);

  topic: TopicContent | null = null;
  slug = '';

  ngOnInit(): void {
    this.slug  = this.route.snapshot.paramMap.get('topic') ?? '';
    this.topic = TOPICS[this.slug] ?? null;
  }
}
