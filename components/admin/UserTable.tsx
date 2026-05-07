// components/admin/UserTable.tsx
'use client';

import { useTransition, useState } from 'react';
import { deleteUser, changePassword } from '@/app/actions/user';

const roleLabel: Record<string, string> = {
  admin:     '관리자',
  moderator: '중재자',
  user:      '일반',
};

const roleColor: Record<string, string> = {
  admin:     '#c0392b',
  moderator: '#d97706',
  user:      '',
};

export default function UserTable({ users }: { users: any[] }) {
  const [pending, startTransition] = useTransition();
  const [changingId, setChangingId] = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDelete = (targetId: string, name: string) => {
    if (!confirm(`${name} 계정을 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      const res = await deleteUser(targetId);
      if (res?.error) setError(res.error);
      else setSuccess(`${name} 계정이 삭제되었습니다.`);
    });
  };

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>, targetId: string) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await changePassword(targetId, fd);
      if (res?.error) setError(res.error);
      else { setSuccess('비밀번호가 변경되었습니다.'); setChangingId(null); }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {error   && <p style={{ fontSize: '13px', color: '#f87171', backgroundColor: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '12px' }}>{error}</p>}
      {success && <p style={{ fontSize: '13px', color: '#4ade80', backgroundColor: '#052e16', border: '1px solid #14532d', borderRadius: '8px', padding: '12px' }}>{success}</p>}

      {users.map((u) => (
        <div key={u.id} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: '600', color: 'var(--text)', fontSize: '14px' }}>{u.name}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{u.id}</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid var(--border)',
                color: roleColor[u.role] || 'var(--text-sub)',
              }}>
                {roleLabel[u.role] ?? u.role}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setChangingId(changingId === u.id ? null : u.id)}
                style={{ fontSize: '12px', padding: '4px 10px', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-sub)', background: 'transparent', cursor: 'pointer' }}
              >
                비밀번호 변경
              </button>
              <button
                onClick={() => handleDelete(u.id, u.name)}
                disabled={pending}
                style={{ fontSize: '12px', padding: '4px 10px', border: '1px solid var(--border)', borderRadius: '4px', color: '#f87171', background: 'transparent', cursor: 'pointer', opacity: pending ? 0.5 : 1 }}
              >
                삭제
              </button>
            </div>
          </div>

          {changingId === u.id && (
            <form onSubmit={(e) => handleChangePassword(e, u.id)} style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <input
                name="password"
                type="password"
                required
                placeholder="새 비밀번호 (4자 이상)"
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={pending}
                style={{ padding: '8px 16px', backgroundColor: 'var(--accent)', color: 'var(--accent-text)', fontWeight: '600', fontSize: '13px', borderRadius: '6px', border: 'none', cursor: 'pointer', opacity: pending ? 0.6 : 1 }}
              >
                변경
              </button>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}