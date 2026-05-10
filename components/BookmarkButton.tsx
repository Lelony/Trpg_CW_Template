// components/BookmarkButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { toggleBookmarkAction } from '@/app/actions/bookmark';

export default function BookmarkButton({ postId, initialBookmarked }: {
  postId: string;
  initialBookmarked: boolean;
}) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [pending, startTransition]      = useTransition();

  const handleToggle = () => {
    setIsBookmarked((prev) => !prev); // 낙관적 업데이트
    startTransition(async () => {
      const res = await toggleBookmarkAction(postId);
      if (res?.error) {
        setIsBookmarked((prev) => !prev); // 실패 시 롤백
      } else if (res?.isBookmarked !== undefined) {
        setIsBookmarked(res.isBookmarked);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      title={isBookmarked ? '북마크 해제' : '북마크 추가'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '6px 14px',
        borderRadius: '6px',
        border: `1px solid ${isBookmarked ? 'var(--accent)' : 'var(--border)'}`,
        backgroundColor: isBookmarked ? 'var(--accent)' : 'transparent',
        color: isBookmarked ? 'var(--accent-text)' : 'var(--text-sub)',
        cursor: pending ? 'not-allowed' : 'pointer',
        fontSize: '13px',
        fontWeight: isBookmarked ? '600' : '400',
        transition: 'all 0.15s',
        opacity: pending ? 0.6 : 1,
      }}
    >
      <span>{isBookmarked ? '★' : '☆'}</span>
      <span>{isBookmarked ? '북마크됨' : '북마크'}</span>
    </button>
  );
}