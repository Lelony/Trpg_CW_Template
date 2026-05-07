// components/DeleteButton.tsx
'use client';

import { useTransition } from 'react';
import { deletePost } from '@/app/actions/post';

export default function DeleteButton({ id, sha }: { id: string; sha: string }) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
    startTransition(async () => {
      await deletePost(id, sha);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      style={{
        fontSize: '13px',
        padding: '6px 14px',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        color: '#f87171',
        background: 'transparent',
        cursor: pending ? 'not-allowed' : 'pointer',
        opacity: pending ? 0.6 : 1,
      }}
    >
      {pending ? '삭제 중...' : '게시글 삭제'}
    </button>
  );
}