// app/login/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signIn('credentials', {
        id: fd.get('id'),
        password: fd.get('password'),
        redirect: false,
      });
      if (result?.error) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
        router.push('/');
        router.refresh();
      }
    });
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent)', textAlign: 'center', marginBottom: '8px', letterSpacing: '0.05em' }}>
          닌-쟈 일기장
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-sub)', textAlign: 'center', marginBottom: '32px' }}>
          로그인하여 게시글을 확인하세요
        </p>

        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {error && (
            <p style={{ fontSize: '14px', color: '#f87171', backgroundColor: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '12px' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-sub)' }}>아이디</label>
            <input
              name="id"
              required
              placeholder="아이디를 입력하세요"
              style={{
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '14px',
                color: 'var(--text)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-sub)' }}>비밀번호</label>
            <input
              name="password"
              type="password"
              required
              placeholder="비밀번호를 입력하세요"
              style={{
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '14px',
                color: 'var(--text)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-text)',
              fontWeight: '600',
              fontSize: '15px',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: pending ? 'not-allowed' : 'pointer',
              opacity: pending ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {pending ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>
          계정이 없으면 관리자에게 문의하세요.
        </p>
      </div>
    </main>
  );
}