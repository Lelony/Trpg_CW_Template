// components/SpoilerMask.tsx
export default function SpoilerMask({ status, publishAt, isLoggedIn }: {
  status: string;
  publishAt?: string;
  isLoggedIn: boolean;
}) {
  const publishDate = publishAt ? new Date(publishAt).toLocaleString('ko-KR') : null;

  return (
    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', margin: '16px 0' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--bg-card)', opacity: 0.85, backdropFilter: 'blur(4px)', zIndex: 1 }} />
      <div style={{ filter: 'blur(4px)', userSelect: 'none', fontSize: '14px', color: 'var(--text-muted)', padding: '16px', lineHeight: 1.7 }} aria-hidden>
        이 게시글의 내용은 아직 공개되지 않았습니다. 비밀이 숨겨져 있습니다. 내용을 볼 수 없습니다...
      </div>
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '32px 16px' }}>
        <p style={{ fontSize: '28px', marginBottom: '12px' }}>-</p>
        {status === 'timed' && publishDate ? (
          <>
            <p style={{ color: 'var(--accent)', fontWeight: '600', marginBottom: '4px' }}>예약 공개 게시글</p>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px' }}>{publishDate} 이후 공개됩니다.</p>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--text)', fontWeight: '600', marginBottom: '4px' }}>
              {isLoggedIn ? '접근 권한이 없습니다' : '로그인이 필요합니다'}
            </p>
            <p style={{ color: 'var(--text-sub)', fontSize: '14px', marginBottom: '12px' }}>
              {isLoggedIn ? '이 게시글은 작성자만 볼 수 있습니다.' : '로그인 후 공개 게시글을 확인할 수 있습니다.'}
            </p>
            {!isLoggedIn && (
              <a href="/login" style={{
                display: 'inline-block',
                padding: '8px 20px',
                border: '1px solid var(--accent)',
                borderRadius: '6px',
                color: 'var(--accent)',
                fontSize: '14px',
              }}>
                로그인
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}