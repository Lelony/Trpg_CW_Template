// components/ThemeProvider.tsx
'use client';

import { useEffect } from 'react';

export default function ThemeProvider({ settings }: { settings: any }) {
  useEffect(() => {
    if (!settings) return;

    const applyTheme = (theme: 'shinobi' | 'sns') => {
      const colors = settings[theme];
      if (!colors) return;
      const root = document.documentElement;
      root.style.setProperty('--bg',           colors.bg);
      root.style.setProperty('--bg-card',      colors.bgCard);
      root.style.setProperty('--bg-header',    colors.bgHeader);
      root.style.setProperty('--border',       colors.border);
      root.style.setProperty('--border-hover', colors.borderHover);
      root.style.setProperty('--text',         colors.text);
      root.style.setProperty('--text-sub',     colors.textSub);
      root.style.setProperty('--text-muted',   colors.textMuted);
      root.style.setProperty('--accent',       colors.accent);
      root.style.setProperty('--accent-text',  colors.accentText);
      root.style.setProperty('--tag',          colors.tag);
    };

    const saved = (localStorage.getItem('theme') as 'shinobi' | 'sns') ?? 'shinobi';
    document.documentElement.setAttribute('data-theme', saved);
    applyTheme(saved);

    // 테마 전환 감지
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute('data-theme') as 'shinobi' | 'sns';
      applyTheme(current);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, [settings]);

  return null;
}