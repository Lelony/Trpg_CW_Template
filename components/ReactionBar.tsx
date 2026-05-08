// components/ReactionBar.tsx
'use client';

import { useState, useTransition } from 'react';
import { reactToPost } from '@/app/actions/reaction';

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

export default function ReactionBar({ postId, reactions, currentUserId }: {
  postId: string;
  reactions: Record<string, string[]>;
  currentUserId: string | null;
}) {
  const [localReactions, setLocalReactions] = useState<Record<string, string[]>>(reactions ?? {});
  const [showPicker, setShowPicker]         = useState(false);
  const [pending, startTransition]          = useTransition();

  const myEmoji = currentUserId
    ? EMOJIS.find((e) => localReactions[e.emoji]?.includes(currentUserId))?.emoji ?? null
    : null;

  // 실제로 리액션이 달린 이모지만 필터링
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
      const res = await reactToPost(postId, emoji);
      if (res?.reactions) setLocalReactions(res.reactions);
    });
  };

  return (
    <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>

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
              gap: '5px',
              padding: '5px 12px',
              borderRadius: '999px',
              border: `1px solid ${isMyPick ? 'var(--accent)' : 'var(--border)'}`,
              backgroundColor: isMyPick ? 'var(--accent)' : 'var(--bg)',
              color: isMyPick ? 'var(--accent-text)' : 'var(--text-sub)',
              cursor: currentUserId ? 'pointer' : 'default',
              fontSize: '14px',
              fontWeight: isMyPick ? '600' : '400',
              transition: 'all 0.15s',
              opacity: pending ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: '16px' }}>{emoji}</span>
            <span style={{ fontSize: '13px' }}>{count}</span>
          </button>
        );
      })}

      {/* 리액션 추가 버튼 */}
      {currentUserId && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPicker((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 12px',
              borderRadius: '999px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.15s',
            }}
            title="리액션 추가"
          >
            <span>{myEmoji ?? '+'}</span>
            {!myEmoji && <span style={{ fontSize: '12px' }}>리액션</span>}
          </button>

          {/* 이모지 피커 */}
          {showPicker && (
            <div style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: 0,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '10px',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '4px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              zIndex: 50,
            }}>
              {EMOJIS.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  title={label}
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    border: myEmoji === emoji ? '1px solid var(--accent)' : '1px solid transparent',
                    backgroundColor: myEmoji === emoji ? 'var(--accent)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '20px',
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

      {!currentUserId && (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          <a href="/login" style={{ color: 'var(--accent)' }}>로그인</a> 후 리액션 가능
        </span>
      )}
    </div>
  );
}