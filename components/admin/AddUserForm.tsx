// components/admin/AddUserForm.tsx
'use client';

import { useState, useTransition, useRef } from 'react';
import { createUser } from '@/app/actions/user';

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

const labelStyle = {
  fontSize: '13px',
  color: 'var(--text-sub)',
  marginBottom: '6px',
  display: 'block',
};

export default function AddUserForm() {
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null); setSuccess(null);
    startTransition(async () => {
      const res = await createUser(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess('새 유저가 추가되었습니다.');
        formRef.current?.reset();
      }
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
      {error   && <p style={{ fontSize: '13px', color: '#f87171', backgroundColor: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '12px' }}>{error}</p>}
      {success && <p style={{ fontSize: '13px', color: '#4ade80', backgroundColor: '#052e16', border: '1px solid #14532d', borderRadius: '8px', padding: '12px' }}>{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>아이디 *</label>
          <input name="id" required placeholder="영문, 숫자, _" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>이름 *</label>
          <input name="name" required placeholder="표시될 이름" style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>비밀번호 *</label>
          <input name="password" type="password" required placeholder="4자 이상" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>권한 *</label>
          <select name="role" style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="user">일반 유저</option>
            <option value="moderator">중재자</option>
            <option value="admin">관리자</option>
          </select>
        </div>
      </div>

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
          fontFamily: 'var(--font-body)',
          letterSpacing: 'var(--letter-spacing)',
        }}
      >
        {pending ? '추가 중...' : '유저 추가'}
      </button>
    </form>
  );
}