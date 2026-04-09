import { Injectable, signal, computed } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

type Theme = 'dark' | 'light';
const THEME_KEY = 'fv_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<Theme>('dark');

  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor(private storage: LocalStorageService) {
    const saved = this.storage.get<Theme>(THEME_KEY, 'dark');
    this._theme.set(saved);
    this.applyTheme(saved);
  }

  toggle(): void {
    const next: Theme = this._theme() === 'dark' ? 'light' : 'dark';
    this._theme.set(next);
    this.applyTheme(next);
    this.storage.set(THEME_KEY, next);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
