import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface TopicCard {
  slug: string;
  title: string;
  icon: string;
  summary: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  readTime: string;
}

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './learn.component.html',
  styleUrl: './learn.component.css',
})
export class LearnComponent {
  topics: TopicCard[] = [
    {
      slug: 'what-is-forex',
      title: 'What is Forex?',
      icon: '🌍',
      summary: "Learn about the foreign exchange market, the world's largest financial market with $7.5 trillion traded daily.",
      difficulty: 'Beginner',
      readTime: '3 min',
    },
    {
      slug: 'currency-pairs',
      title: 'Currency Pairs',
      icon: '💱',
      summary: 'Understand majors, minors and exotics. Learn how base and quote currencies work together.',
      difficulty: 'Beginner',
      readTime: '4 min',
    },
    {
      slug: 'pips-and-spreads',
      title: 'Pips & Spreads',
      icon: '📏',
      summary: 'What is a pip? How does the spread affect your trades? Master these fundamental concepts.',
      difficulty: 'Beginner',
      readTime: '5 min',
    },
    {
      slug: 'leverage-and-margin',
      title: 'Leverage & Margin',
      icon: '⚡',
      summary: 'Leverage amplifies your gains — and losses. Understand margin requirements and risk control.',
      difficulty: 'Intermediate',
      readTime: '6 min',
    },
    {
      slug: 'reading-charts',
      title: 'Reading Charts',
      icon: '📊',
      summary: 'Candlestick charts, support & resistance, and key chart patterns every trader should know.',
      difficulty: 'Intermediate',
      readTime: '7 min',
    },
    {
      slug: 'risk-management',
      title: 'Risk Management',
      icon: '🛡️',
      summary: 'The foundation of long-term profitability. Position sizing, stop losses and the 2% rule.',
      difficulty: 'Advanced',
      readTime: '8 min',
    },
  ];

  difficultyClass(d: string): string {
    if (d === 'Beginner')    return 'badge-green';
    if (d === 'Intermediate') return 'badge-yellow';
    return 'badge-red';
  }
}
