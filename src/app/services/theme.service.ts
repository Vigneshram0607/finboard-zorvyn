import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private getInitialTheme(): Theme {
    // 1. Check persisted user preference
    const stored = this.storage.get<Theme>('theme');
    if (stored) return stored;
    // 2. Respect OS/browser preference
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  }

  private _theme$: BehaviorSubject<Theme>;

  theme$: ReturnType<typeof this._theme$.asObservable>;

  get current(): Theme { return this._theme$.getValue(); }
  get isDark(): boolean { return this._theme$.getValue() === 'dark'; }

  constructor(private storage: StorageService) {
    const initial = this.getInitialTheme();
    this._theme$ = new BehaviorSubject<Theme>(initial);
    this.theme$  = this._theme$.asObservable();
    this.apply(initial);
  }

  toggle(): void {
    const next: Theme = this.current === 'dark' ? 'light' : 'dark';
    this._theme$.next(next);
    this.storage.set('theme', next);
    this.apply(next);
  }

  setTheme(t: Theme): void {
    this._theme$.next(t);
    this.storage.set('theme', t);
    this.apply(t);
  }

  private apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
