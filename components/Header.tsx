// components/Header.tsx
'use client';

import { signOut, useSession } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

export default function Header({ settings }: { settings: any }) {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <header className="site-header" style={{
      backgroundColor: 'var(--bg-header)',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <a href="/" style={{
        fontFamily: 'var(--font-title)',
        fontWeight: '700',
        fontSize: '20px',
        letterSpacing: '0.12em',
        color: 'var(--accent)',
      }}>
        {settings?.siteName ?? '닌-쟈 일기장'}
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ThemeToggle
          shinobiName={settings?.shinobiModeName ?? '시노비 모드'}
          snsName={settings?.snsModeName ?? 'SNS 모드'}
        />
        <a href="/help" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          사용 안내
        </a>
        {user ? (
          <>
            <NotificationBell userId={user.id} />
            <a href="/mypage" style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
              {user.name}
            </a>
            {user.role === 'admin' && (
              <a href="/admin" style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
                관리자
              </a>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                fontSize: '13px',
                padding: '5px 12px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-sub)',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <a href="/login" style={{
            fontSize: '13px',
            padding: '5px 12px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            color: 'var(--text-sub)',
          }}>
            로그인
          </a>
        )}
      </div>
    </header>
  );
}