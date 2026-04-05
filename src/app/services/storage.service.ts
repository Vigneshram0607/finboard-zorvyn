import { Injectable } from '@angular/core';

const STORAGE_VERSION = 'v1';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private prefix = `finboard_${STORAGE_VERSION}`;

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(`${this.prefix}_${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`${this.prefix}_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('StorageService: write failed', e);
    }
  }

  remove(key: string): void {
    try { localStorage.removeItem(`${this.prefix}_${key}`); } catch { /* noop */ }
  }

  clear(): void {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(this.prefix))
        .forEach(k => localStorage.removeItem(k));
    } catch { /* noop */ }
  }
}
