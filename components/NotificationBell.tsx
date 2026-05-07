// components/NotificationBell.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchNotifications } from '@/app/actions/notification';

const STORAGE_KEY = 'ninja_last_checked';

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getLastChecked = () =>
    localStorage.getItem(`${STORAGE_KEY}_${userId}`) ?? new Date(0).toISOString();

  const saveLastChecked = () =>
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, new Date().toISOString());

  const loadNotifications = async () => {
    setLoading(true);
    const lastChecked = getLastChecked();
    const res = await fetchNotifications(lastChecked);
    setNotifications(res.notifications ?? []);
    setLoading(false);
  };

  // 마운트 시 + 60초마다 폴링
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleRead = (postId: string) => {
    saveLastChecked();
    setNotifications([]);
    setOpen(false);
    window.location.href = `/posts/${postId}`;
  };

  const handleAllRead = () => {
    saveLastChecked();
    setNotifications([]);
    setOpen(false);
  };

  const count = notifications.length;

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* 벨 버튼 */}
      <button
        onClick={handleOpen}
        style={{
          position: 'relative',
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '5px 10px',
          cursor: 'pointer',
          color: count > 0 ? 'var(--accent)' : 'var(--text-muted)',
          fontSize: '14px',
          transition: 'all 0.2s',
        }}
        title="알림"
      >
        {count > 0 ? '🔔' : '🔕'}
        {count > 0 && (
          <span style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
            fontSize: '10px',
            fontWeight: '700',
            borderRadius: '999px',
            minWidth: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
          }}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '320px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 100,
          overflow: 'hidden',
        }}>
          {/* 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', fontFamily: 'var(--font-title)' }}>
              알림 {count > 0 && <span style={{ color: 'var(--accent)' }}>{count}</span>}
            </span>
            {count > 0 && (
              <button
                onClick={handleAllRead}
                style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                모두 읽음
              </button>
            )}
          </div>

          {/* 알림 목록 */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {loading ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
                불러오는 중...
              </p>
            ) : count === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
                새 알림이 없습니다.
              </p>
            ) : (
              // notifications.map 부분 교체
notifications.map((n) => (
  <button
    key={n.commentId + n.createdAt}
    onClick={() => handleRead(n.postId)}
    style={{
      display: 'block',
      width: '100%',
      textAlign: 'left',
      padding: '12px 16px',
      borderBottom: `1px solid var(--border)`,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg)'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
  >
<p style={{ fontSize: '12px', color: 'var(--text-sub)', margin: '0 0 4px', fontWeight: '600' }}>
  <span style={{ color: 'var(--accent)' }}>{n.authorName}</span>
  {n.type === 'reply'   && ' 님이 내 댓글에 답글을 달았습니다'}
  {n.type === 'mention' && ' 님이 답글에서 나를 언급했습니다'}
  {n.type === 'comment' && ' 님이 댓글을 달았습니다'}
</p>
    <p style={{ fontSize: '13px', color: 'var(--text)', margin: '0 0 4px', fontFamily: 'var(--font-title)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {n.postTitle}
    </p>
    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {n.content}
    </p>
    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
      {new Date(n.createdAt).toLocaleString('ko-KR')}
    </p>
  </button>
))
            )}
          </div>
        </div>
      )}
    </div>
  );
}