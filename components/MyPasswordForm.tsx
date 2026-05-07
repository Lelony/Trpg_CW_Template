// components/MyPasswordForm.tsx
'use client';

import { useState, useTransition, useRef } from 'react';
import { changeMyPassword } from '@/app/actions/user';

const inputStyle = {
  backgroundColor: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '10px 12px',
  fontSize: '14px',
  color: 'var(--text)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const,
};

export default function MyPasswordForm() {
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null); setSuccess(null);
    startTransition(async () => {
      const res = await changeMyPassword(fd);
      if (res?.error) setError(res.error);
      else { setSuccess('비밀번호가 변경되었습니다.'); formRef.current?.reset(); }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {error   && <p style={{ fontSize: '14px', color: '#f87171', backgroundColor: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '12px' }}>{error}</p>}
      {success && <p style={{ fontSize: '14px', color: '#4ade80', backgroundColor: '#052e16', border: '1px solid #14532d', borderRadius: '8px', padding: '12px' }}>{success}</p>}

      {[
        { name: 'currentPassword', label: '현재 비밀번호' },
        { name: 'newPassword',     label: '새 비밀번호 (4자 이상)' },
        { name: 'confirmPassword', label: '새 비밀번호 확인' },
      ].map(({ name, label }) => (
        <div key={name}>
          <label style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '6px', display: 'block' }}>{label}</label>
          <input name={name} type="password" required style={inputStyle} />
        </div>
      ))}

      <button
        type="submit"
        disabled={pending}
        style={{
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-text)',
          fontWeight: '600',
          fontSize: '15px',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          cursor: pending ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? '변경 중...' : '비밀번호 변경'}
      </button>
    </form>
  );
}