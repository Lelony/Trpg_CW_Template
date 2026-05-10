// components/BookmarkButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { toggleBookmarkAction } from '@/app/actions/bookmark';

export default function BookmarkButton({ postId, initialBookmarked, compact = false }: {
  postId: string;
  initialBookmarked: boolean;
  compact?: boolean;
}) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [pending, startTransition]      = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // 목록에서 카드 클릭과 구분
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
    startTransition(async () => {
      const res = await toggleBookmarkAction(postId);
      if (res?.error) {
        setIsBookmarked((prev) => !prev);
      } else if (res?.isBookmarked !== undefined) {
        setIsBookmarked(res.isBookmarked);
      }
    });
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        disabled={pending}
        title={isBookmarked ? '북마크 해제' : '북마크 추가'}
        style={{
          background: 'none',
          border: 'none',
          cursor: pending ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)',
          padding: '0',
          opacity: pending ? 0.5 : 1,
          transition: 'all 0.15s',
        }}
      >
        {isBookmarked ? '★' : '☆'}
      </button>
    );
  }

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