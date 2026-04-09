import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard — ForexVista',
  },
  {
    path: 'trade',
    loadComponent: () => import('./features/trading/trading.component').then(m => m.TradingComponent),
    title: 'Trade — ForexVista',
  },
  {
    path: 'trade/:pair',
    loadComponent: () => import('./features/trading/trading.component').then(m => m.TradingComponent),
    title: 'Trade — ForexVista',
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent),
    title: 'Trade History — ForexVista',
  },
  {
    path: 'learn',
    loadComponent: () => import('./features/learn/learn.component').then(m => m.LearnComponent),
    title: 'Learn Forex — ForexVista',
  },
  {
    path: 'learn/:topic',
    loadComponent: () => import('./features/learn/learn-detail/learn-detail.component').then(m => m.LearnDetailComponent),
    title: 'Learn — ForexVista',
  },
  { path: '**', redirectTo: 'dashboard' },
];
