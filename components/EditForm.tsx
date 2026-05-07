// components/EditForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { updatePost } from '@/app/actions/post';

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

export default function EditForm({ post, users }: { post: any; users: { id: string; name: string }[] }) {
  const [status, setStatus] = useState<'private' | 'public' | 'timed' | 'selective'>(post.status);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(post.allowedUsers ?? []);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('allowedUsers', selectedUsers.join(','));
    startTransition(async () => {
      const res = await updatePost(post.id, post.sha, fd);
      if (res?.error) setError(res.error);
    });
  };

  const statusOptions = [
    { value: 'private',   label: '[비공개]',        desc: '작성자·관리자만' },
    { value: 'public',    label: '[공개]',           desc: '전체 공개' },
    { value: 'timed',     label: '[예약 공개]',      desc: '지정 시각 이후 공개' },
    { value: 'selective', label: '[지정 유저 공개]',  desc: '선택한 유저만' },
  ] as const;

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}>
      {error && (
        <p style={{ fontSize: '14px', color: '#f87171', backgroundColor: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '12px' }}>
          {error}
        </p>
      )}

      <div>
        <label style={labelStyle}>제목 *</label>
        <input name="title" required defaultValue={post.title} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>내용 *</label>
        <textarea name="content" required rows={10} defaultValue={post.content} style={{ ...inputStyle, resize: 'none', lineHeight: 1.7 }} />
      </div>

      <div>
        <label style={labelStyle}>태그 (쉼표로 구분)</label>
        <input name="tags" defaultValue={post.tags?.join(', ')} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>공개 설정 *</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {statusOptions.map((s) => (
            <label key={s.value} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '10px 14px',
              borderRadius: '8px',
              border: `1px solid ${status === s.value ? 'var(--accent)' : 'var(--border)'}`,
              backgroundColor: status === s.value ? 'var(--bg)' : 'transparent',
              transition: 'all 0.15s',
            }}>
              <input
                type="radio"
                name="status"
                value={s.value}
                checked={status === s.value}
                onChange={() => setStatus(s.value)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600', minWidth: '100px' }}>{s.label}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.desc}</span>
            </label>
          ))}
        </div>
      </div>

      {status === 'timed' && (
        <div>
          <label style={labelStyle}>공개 예약 시각 *</label>
          <input type="datetime-local" name="publishAt" defaultValue={post.publishAt?.slice(0, 16)} style={{ ...inputStyle, width: '100%', cursor: 'pointer' }} />
        </div>
      )}

      {status === 'selective' && (
        <div>
          <label style={labelStyle}>공개할 유저 선택 * (GM·중재자는 자동 포함)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            {users.length === 0 && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>등록된 유저가 없습니다.</p>
            )}
            {users.map((u) => (
              <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-sub)' }}>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u.id)}
                  onChange={() => toggleUser(u.id)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span style={{ color: 'var(--text)' }}>{u.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>@{u.id}</span>
              </label>
            ))}
          </div>
        </div>
      )}

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
        {pending ? '저장 중...' : '수정 완료'}
      </button>
    </form>
  );
}
