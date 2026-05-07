// components/PostList.tsx
'use client';

import { useState, useMemo } from 'react';
import PostCard from './PostCard';

const POSTS_PER_PAGE = 30;

export default function PostList({ posts, currentUserId }: {
  posts: any[];
  currentUserId?: string;
}) {
  const [search,     setSearch]     = useState('');
  const [tagFilter,  setTagFilter]  = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [page,       setPage]       = useState(1);

  // 전체 태그 목록 추출
  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags?.forEach((t: string) => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  // 전체 작성자 목록 추출
  const allAuthors = useMemo(() => {
    const map = new Map<string, string>();
    posts.forEach((p) => map.set(p.authorId, p.authorName));
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [posts]);

  // 필터링
  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch = search === '' || p.title.toLowerCase().includes(search.toLowerCase());
      const matchTag    = tagFilter === '' || p.tags?.includes(tagFilter);
      const matchAuthor = authorFilter === '' || p.authorId === authorFilter;
      return matchSearch && matchTag && matchAuthor;
    });
  }, [posts, search, tagFilter, authorFilter]);

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  // 필터 변경 시 첫 페이지로
  const handleSearch = (v: string) => { setSearch(v);       setPage(1); };
  const handleTag    = (v: string) => { setTagFilter(v);    setPage(1); };
  const handleAuthor = (v: string) => { setAuthorFilter(v); setPage(1); };

  const inputStyle = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    color: 'var(--text)',
    outline: 'none',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none' as const,
    paddingRight: '28px',
  };

  return (
    <div>
      {/* 검색 + 필터 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="제목 검색..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: '160px' }}
        />
        <div style={{ position: 'relative' }}>
          <select
            value={tagFilter}
            onChange={(e) => handleTag(e.target.value)}
            style={selectStyle}
          >
            <option value="">전체 태그</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>#{tag}</option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '11px' }}>▼</span>
        </div>
        <div style={{ position: 'relative' }}>
          <select
            value={authorFilter}
            onChange={(e) => handleAuthor(e.target.value)}
            style={selectStyle}
          >
            <option value="">전체 작성자</option>
            {allAuthors.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '11px' }}>▼</span>
        </div>
        {(search || tagFilter || authorFilter) && (
          <button
            onClick={() => { handleSearch(''); handleTag(''); handleAuthor(''); }}
            style={{ ...inputStyle, cursor: 'pointer', color: 'var(--accent)', border: '1px solid var(--border)', background: 'transparent' }}
          >
            초기화
          </button>
        )}
      </div>

      {/* 결과 수 */}
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        {filtered.length}개의 게시글
        {totalPages > 1 && ` · ${page} / ${totalPages} 페이지`}
      </p>

      {/* 게시글 목록 */}
      {paginated.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {paginated.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isContentVisible={post._isVisible}
              currentUserId={currentUserId}
            />
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px', fontSize: '14px' }}>
          검색 결과가 없습니다.
        </p>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', marginTop: '32px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            style={{ ...inputStyle, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, padding: '6px 10px' }}
          >
            «
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ ...inputStyle, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, padding: '6px 10px' }}
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
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
                  onClick={() => setPage(p as number)}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                    padding: '6px 12px',
                    backgroundColor: page === p ? 'var(--accent)' : 'var(--bg-card)',
                    color: page === p ? 'var(--accent-text)' : 'var(--text-sub)',
                    border: `1px solid ${page === p ? 'var(--accent)' : 'var(--border)'}`,
                    fontWeight: page === p ? '600' : '400',
                  }}
                >
                  {p}
                </button>
              )
            )
          }

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ ...inputStyle, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, padding: '6px 10px' }}
          >
            ›
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            style={{ ...inputStyle, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1, padding: '6px 10px' }}
          >
            »
          </button>
        </div>
      )}
    </div>
  );
}