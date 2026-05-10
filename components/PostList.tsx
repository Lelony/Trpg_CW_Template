'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from './PostCard';

function FilterSection({ title, activeCount, children }: {
  title: string;
  activeCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 12px',
          backgroundColor: 'var(--bg-card)',
          border: `1px solid ${activeCount > 0 ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px',
          color: activeCount > 0 ? 'var(--accent)' : 'var(--text-sub)',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
        {activeCount > 0 && (
          <span style={{
            fontSize: '10px',
            padding: '1px 6px',
            borderRadius: '999px',
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
            fontWeight: '600',
          }}>
            {activeCount}
          </span>
        )}
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          zIndex: 10,
          minWidth: '240px',
          maxWidth: '320px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function PostList({ posts, currentUserId, currentPage, totalPages, total }: {
  posts: any[];
  currentUserId?: string;
  currentPage: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();
  const [search,        setSearch]        = useState('');
  const [tagFilters,    setTagFilters]    = useState<string[]>([]);
  const [authorFilters, setAuthorFilters] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags?.forEach((t: string) => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  const allAuthors = useMemo(() => {
    const map = new Map<string, string>();
    posts.forEach((p) => map.set(p.authorId, p.authorName));
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [posts]);

  // 현재 페이지 내에서만 검색/필터
  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch = search === '' || p.title.toLowerCase().includes(search.toLowerCase());
      const matchTag    = tagFilters.length === 0 || tagFilters.some((t) => p.tags?.includes(t));
      const matchAuthor = authorFilters.length === 0 || authorFilters.includes(p.authorId);
      return matchSearch && matchTag && matchAuthor;
    });
  }, [posts, search, tagFilters, authorFilters]);

  const toggleTag = (tag: string) => {
    setTagFilters((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const toggleAuthor = (id: string) => {
    setAuthorFilters((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };

  const resetAll = () => {
    setSearch('');
    setTagFilters([]);
    setAuthorFilters([]);
  };

  const hasFilter = search || tagFilters.length > 0 || authorFilters.length > 0;

  const goToPage = (page: number) => {
    router.push(`/?page=${page}`);
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '7px 12px',
    fontSize: '13px',
    color: 'var(--text)',
    outline: 'none',
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: '999px',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    backgroundColor: active ? 'var(--accent)' : 'transparent',
    color: active ? 'var(--accent-text)' : 'var(--text-sub)',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontWeight: active ? '600' : '400',
  });

  return (
    <div>
      {/* 검색 + 필터 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="제목 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: '160px', boxSizing: 'border-box' as const }}
        />

        {allTags.length > 0 && (
          <FilterSection title="태그" activeCount={tagFilters.length}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {allTags.map((tag) => (
                <button key={tag} onClick={() => toggleTag(tag)} style={chipStyle(tagFilters.includes(tag))}>
                  #{tag}
                </button>
              ))}
            </div>
          </FilterSection>
        )}

        {allAuthors.length > 0 && (
          <FilterSection title="작성자" activeCount={authorFilters.length}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {allAuthors.map(([id, name]) => (
                <button key={id} onClick={() => toggleAuthor(id)} style={chipStyle(authorFilters.includes(id))}>
                  {name}
                </button>
              ))}
            </div>
          </FilterSection>
        )}

        {hasFilter && (
          <button
            onClick={resetAll}
            style={{ fontSize: '12px', padding: '7px 12px', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--accent)', background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            초기화
          </button>
        )}
      </div>

      {/* 결과 수 */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          전체 {total}개
          {totalPages > 1 && ` · ${currentPage} / ${totalPages} 페이지`}
          {hasFilter && ` · 필터 결과 ${filtered.length}개`}
        </p>
      </div>

      {/* 게시글 목록 */}
      {filtered.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isContentVisible={post._isVisible}
              currentUserId={currentUserId}
              isBookmarked={post._isBookmarked}
            />
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px', fontSize: '14px' }}>
          {hasFilter ? '검색 결과가 없습니다.' : '아직 작성된 게시글이 없습니다.'}
        </p>
      )}

      {/* 서버 사이드 페이지네이션 */}
      {totalPages > 1 && !hasFilter && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', marginTop: '32px', flexWrap: 'wrap' }}>
          <button onClick={() => goToPage(1)} disabled={currentPage === 1} style={{ ...inputStyle, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, padding: '6px 10px' }}>«</button>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} style={{ ...inputStyle, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, padding: '6px 10px' }}>‹</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
            .reduce<(number | string)[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} style={{ padding: '6px 4px', color: 'var(--text-muted)', fontSize: '13px' }}>···</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p as number)}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    padding: '6px 12px',
                    backgroundColor: currentPage === p ? 'var(--accent)' : 'var(--bg-card)',
                    color: currentPage === p ? 'var(--accent-text)' : 'var(--text-sub)',
                    border: `1px solid ${currentPage === p ? 'var(--accent)' : 'var(--border)'}`,
                    fontWeight: currentPage === p ? '600' : '400',
                  }}
                >
                  {p}
                </button>
              )
            )
          }

          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} style={{ ...inputStyle, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, padding: '6px 10px' }}>›</button>
          <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} style={{ ...inputStyle, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, padding: '6px 10px' }}>»</button>
        </div>
      )}
    </div>
  );
}