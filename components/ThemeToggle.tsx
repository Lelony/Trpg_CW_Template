// components/ThemeToggle.tsx
'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle({
  shinobiName = '시노비 모드',
  snsName     = 'SNS 모드',
}: {
  shinobiName?: string;
  snsName?:     string;
}) {
  const [theme,   setTheme]   = useState<'shinobi' | 'sns'>('shinobi');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'shinobi' | 'sns') ?? 'shinobi';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === 'shinobi' ? 'sns' : 'shinobi';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      style={{
        fontSize: '11px',
        padding: '4px 10px',
        borderRadius: '4px',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
        background: 'transparent',
        cursor: 'pointer',
        letterSpacing: '0.06em',
        fontFamily: 'var(--font-body)',
        transition: 'all 0.2s',
      }}
    >
      {theme === 'shinobi' ? snsName : shinobiName}
    </button>
  );
}