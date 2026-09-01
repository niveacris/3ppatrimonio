import { useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';

export function getInitialTheme(): Theme {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('3p_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  }
  return 'dark';
}

export function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.add('light-theme');
  } else {
    root.classList.remove('light-theme');
  }
  localStorage.setItem('3p_theme', theme);
  window.dispatchEvent(new Event('3p_theme_change'));
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Apply on mount and state changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Sync across components / windows
  useEffect(() => {
    const handleThemeChange = () => {
      const current = (localStorage.getItem('3p_theme') as Theme) || 'dark';
      setTheme(current);
    };
    window.addEventListener('3p_theme_change', handleThemeChange);
    return () => window.removeEventListener('3p_theme_change', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return { theme, setTheme, toggleTheme };
}
