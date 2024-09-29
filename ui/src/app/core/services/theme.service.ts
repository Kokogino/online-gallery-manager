import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Theme } from '@app/core/model/theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';

  private theme = new BehaviorSubject<Theme>('dark');

  private storage: Storage = localStorage;

  get theme$(): Observable<Theme> {
    return this.theme.asObservable();
  }

  loadTheme(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.theme.next((this.storage.getItem(this.THEME_KEY) as Theme) || 'dark');
      resolve();
    });
  }

  toggleTheme(): void {
    const nextTheme = this.theme.getValue() === 'dark' ? 'light' : 'dark';
    this.theme.next(nextTheme);
    this.storage.setItem(this.THEME_KEY, nextTheme);
  }
}
