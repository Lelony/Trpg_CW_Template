// components/MiniReactionBar.tsx
'use client';

import { useState, useTransition } from 'react';
import { reactToComment } from '@/app/actions/reaction';

const EMOJIS = [
  { emoji: '👍', label: '좋아요' },
  { emoji: '❤️', label: '최고' },
  { emoji: '😮', label: '놀라워' },
  { emoji: '😂', label: '웃겨' },
  { emoji: '😢', label: '슬퍼' },
  { emoji: '😡', label: '화나' },
  { emoji: '🔥', label: '불꽃' },
  { emoji: '👀', label: '눈여겨봄' },
  { emoji: '🎉', label: '축하' },
  { emoji: '💀', label: '충격' },
];

export default function MiniReactionBar({ postId, commentId, replyId, reactions, currentUserId }: {
  postId: string;
  commentId: string;
  replyId?: string;
  reactions: Record<string, string[]>;
  currentUserId: string | null;
}) {
  const [localReactions, setLocalReactions] = useState<Record<string, string[]>>(reactions ?? {});
  const [showPicker, setShowPicker]         = useState(false);
  const [pending, startTransition]          = useTransition();

  const myEmoji = currentUserId
    ? EMOJIS.find((e) => localReactions[e.emoji]?.includes(currentUserId))?.emoji ?? null
    : null;

  const activeEmojis = EMOJIS.filter((e) => (localReactions[e.emoji]?.length ?? 0) > 0);

  const handleReact = (emoji: string) => {
    if (!currentUserId) return;
    setShowPicker(false);

    setLocalReactions((prev) => {
      const next = { ...prev };
      EMOJIS.forEach((e) => {
        next[e.emoji] = (next[e.emoji] ?? []).filter((id) => id !== currentUserId);
      });
      if (myEmoji !== emoji) {
        if (!next[emoji]) next[emoji] = [];
        next[emoji] = [...next[emoji], currentUserId];
      }
      return next;
    });

    startTransition(async () => {
      const res = await reactToComment(postId, commentId, emoji, replyId);
      if (res?.reactions) setLocalReactions(res.reactions);
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
      {/* 달린 리액션만 표시 */}
      {activeEmojis.map(({ emoji, label }) => {
        const count    = localReactions[emoji]?.length ?? 0;
        const isMyPick = myEmoji === emoji;
        return (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            disabled={pending || !currentUserId}
            title={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '2px 8px',
              borderRadius: '999px',
              border: `1px solid ${isMyPick ? 'var(--accent)' : 'var(--border)'}`,
              backgroundColor: isMyPick ? 'var(--accent)' : 'var(--bg-card)',
              color: isMyPick ? 'var(--accent-text)' : 'var(--text-sub)',
              cursor: currentUserId ? 'pointer' : 'default',
              fontSize: '12px',
              transition: 'all 0.15s',
              opacity: pending ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: '13px' }}>{emoji}</span>
            <span>{count}</span>
          </button>
        );
      })}

      {/* 리액션 추가 버튼 */}
      {currentUserId && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPicker((v) => !v)}
            title="리액션 추가"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: '999px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {myEmoji ?? '+ 😊'}
          </button>

          {showPicker && (
            <div style={{
              position: 'absolute',
              bottom: 'calc(100% + 6px)',
              left: 0,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '2px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              zIndex: 50,
            }}>
              {EMOJIS.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  title={label}
                  style={{
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    border: myEmoji === emoji ? '1px solid var(--accent)' : '1px solid transparent',
                    backgroundColor: myEmoji === emoji ? 'var(--accent)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '18px',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={(e) => { if (myEmoji !== emoji) e.currentTarget.style.backgroundColor = 'var(--bg)'; }}
                  onMouseLeave={(e) => { if (myEmoji !== emoji) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}