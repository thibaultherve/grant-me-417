export type Theme = 'dark' | 'light' | 'system';

export const THEME_STORAGE_KEY = 'vite-ui-theme';

const THEMES = ['dark', 'light', 'system'] as const satisfies readonly Theme[];

export function isTheme(value: unknown): value is Theme {
  return (
    typeof value === 'string' && (THEMES as readonly string[]).includes(value)
  );
}

export function applyThemeToDom(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  const effective =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  root.classList.add(effective);
}

// Synchronously sync the DOM to the stored theme before React mounts.
// Called from main.tsx to prevent FOUC on initial paint.
export function initThemeOnDom(defaultTheme: Theme = 'system'): void {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  applyThemeToDom(isTheme(stored) ? stored : defaultTheme);
}
