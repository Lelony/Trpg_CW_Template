// components/PostCard.tsx
'use client';

export default function PostCard({ post, isContentVisible, currentUserId }: {
  post: any;
  isContentVisible: boolean;
  currentUserId?: string;
}) {
  const statusLabel: Record<string, string> = {
    private:   '秘',
    public:    '公',
    timed:     '時',
    selective: '選',
  };

  const statusDesc: Record<string, string> = {
    private:   '비공개',
    public:    '전체 공개',
    timed:     '예약 공개',
    selective: '지정 공개',
  };

  return (
    <li style={{ listStyle: 'none' }}>
      <a href={`/posts/${post.id}`} style={{ display: 'block', textDecoration: 'none' }}>
        <div
          className="post-card"
          style={{
            backgroundColor: isContentVisible ? 'var(--bg-card)' : 'transparent',
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${isContentVisible ? 'var(--accent)' : 'var(--text-muted)'}`,
            borderRadius: '6px',
            padding: '14px 16px',
            cursor: 'pointer',
            opacity: isContentVisible ? 1 : 0.55,
            transition: 'opacity 0.2s, border-color 0.2s',
            position: 'relative',
          }}
        >
          {/* 우측 상단 뱃지 */}
          <div style={{ position: 'absolute', top: '12px', right: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* 내 글 뱃지 */}
            {post.authorId === currentUserId && (
              <span style={{
                fontSize: '10px',
                padding: '2px 7px',
                borderRadius: '999px',
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-text)',
                fontWeight: '600',
                letterSpacing: '0.04em',
              }}>
                내 글
              </span>
            )}
            {/* 열람 가능 여부 뱃지 */}
            <span style={{
              fontSize: '10px',
              padding: '2px 7px',
              borderRadius: '999px',
              backgroundColor: isContentVisible ? 'var(--accent)' : 'var(--border)',
              color: isContentVisible ? 'var(--accent-text)' : 'var(--text-muted)',
              fontWeight: '600',
              letterSpacing: '0.04em',
              opacity: isContentVisible ? 0.85 : 1,
            }}>
              {isContentVisible ? '열람 가능' : '잠김'}
            </span>
          </div>

          {/* 제목 행 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', paddingRight: '80px' }}>
            <span style={{
              fontSize: '13px',
              fontWeight: '700',
              color: isContentVisible ? 'var(--accent)' : 'var(--text-muted)',
              flexShrink: 0,
              fontFamily: 'var(--font-title)',
              minWidth: '16px',
            }}>
              {statusLabel[post.status] ?? '秘'}
            </span>
            <h2 style={{
              fontWeight: '600',
              fontSize: '15px',
              color: isContentVisible ? 'var(--text)' : 'var(--text-sub)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-title)',
              letterSpacing: 'var(--letter-spacing)',
            }}>
              {post.title}
            </h2>
          </div>

          {/* 메타 정보 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-sub)', flexWrap: 'wrap' }}>
            <span>{post.authorName}</span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ color: isContentVisible ? 'var(--text-muted)' : 'var(--text-muted)', fontSize: '11px' }}>
              {statusDesc[post.status] ?? '비공개'}
            </span>
            {post.tags?.map((tag: string) => (
              <span key={tag} style={{ color: isContentVisible ? 'var(--tag)' : 'var(--text-muted)', fontSize: '11px' }}>
                #{tag}
              </span>
            ))}
          </div>

          {/* 본문 미리보기 — 열람 가능할 때만 */}
          {isContentVisible && post.content && (
            <p style={{
              marginTop: '10px',
              fontSize: '13px',
              color: 'var(--text-muted)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.7,
            }}>
              {post.content.slice(0, 120)}
            </p>
          )}

          {/* 잠김 안내 — 열람 불가일 때 */}
          {!isContentVisible && (
            <p style={{
              marginTop: '8px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            }}>
              {post.status === 'timed' && post.publishAt
                ? `${new Date(post.publishAt).toLocaleString('ko-KR')} 이후 공개`
                : '열람 권한이 없습니다.'}
            </p>
          )}
        </div>
      </a>
    </li>
  );
}