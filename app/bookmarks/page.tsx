// app/bookmarks/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getBookmarks, getPost } from '@/lib/github';
import { canViewContent } from '@/lib/permissions';
import PostCard from '@/components/PostCard';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function BookmarksPage() {
  const session = await auth();
  const user    = session?.user as any;
  if (!user) redirect('/login');

  const { bookmarks } = await getBookmarks();
  const postIds = bookmarks[user.id] ?? [];

  const posts = (await Promise.all(
    postIds.map(async (postId: string) => {
      try {
        return await getPost(postId);
      } catch {
        return null;
      }
    })
  )).filter(Boolean);

const postsWithVisibility = posts.map((post: any) => ({
  ...post,
  _isVisible: canViewContent(post, user),
  _isBookmarked: true, // 북마크 페이지에 있는 글은 무조건 북마크된 상태
}));

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '24px', maxWidth: '768px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <a href="/" style={{ fontSize: '13px', color: 'var(--text-sub)' }}>← 목록으로</a>
      </div>

      <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px', fontFamily: 'var(--font-title)' }}>
        북마크
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        {postIds.length > 0 ? `${postIds.length}개의 게시글` : '북마크한 게시글이 없습니다.'}
      </p>

      {postsWithVisibility.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {postsWithVisibility.map((post: any) => (
  <PostCard
    key={post.id}
    post={post}
    isContentVisible={post._isVisible}
    currentUserId={user.id}
    isBookmarked={post._isBookmarked}
  />
))}
        </ul>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px', fontSize: '14px' }}>
          북마크한 게시글이 없습니다.
        </p>
      )}
    </main>
  );
}