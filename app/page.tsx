// app/page.tsx
import { auth } from '@/lib/auth';
import { getAllPosts } from '@/lib/github';
import { canViewContent } from '@/lib/permissions';
import PostList from '@/components/PostList';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();
  const user = session?.user as any ?? null;
  const posts = await getAllPosts();

  // 서버에서 권한 체크 후 _isVisible 필드 추가
  const postsWithVisibility = posts.map((post: any) => ({
    ...post,
    _isVisible: canViewContent(post, user),
  }));

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '24px', maxWidth: '768px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        {user ? (
          <a href="/write" style={{
            padding: '8px 16px',
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
            fontWeight: '600',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
          }}>
            + 게시글 작성
          </a>
        ) : (
          <a href="/login" style={{ fontSize: '14px', color: 'var(--text-sub)' }}>
            로그인하여 게시글 작성
          </a>
        )}
      </div>

      <PostList
        posts={postsWithVisibility}
        currentUserId={user?.id}
      />
    </main>
  );
}