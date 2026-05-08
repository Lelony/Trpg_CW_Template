// app/posts/[id]/page.tsx
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getPost } from '@/lib/github';
import { canViewContent, canEditPost } from '@/lib/permissions';
import SpoilerMask from '@/components/SpoilerMask';
import DeleteButton from '@/components/DeleteButton';
import CommentSection from '@/components/CommentSection';
import ReactionBar from '@/components/ReactionBar';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user as any ?? null;
  const post = await getPost(id);

  if (!post) notFound();

  const isVisible  = canViewContent(post, user);
  const isEditable = canEditPost(post, user);

  const publishDate = post.status === 'timed' && post.publishAt
    ? new Date(post.publishAt).toLocaleString('ko-KR')
    : null;

  const statusLabel: Record<string, string> = {
    private:   '[비공개]',
    public:    '[공개]',
    timed:     '[예약]',
    selective: '[지정 공개]',
  };

  const comments = post.comments ?? [];

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '24px', maxWidth: '768px', margin: '0 auto' }}>
      <div style={{ marginBottom: '12px' }}>
        <a href="/" style={{ fontSize: '13px', color: 'var(--text-sub)' }}>← 목록으로</a>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text)', margin: 0, lineHeight: 1.4, fontFamily: 'var(--font-title)', letterSpacing: 'var(--letter-spacing)' }}>
            {post.title}
          </h1>
          <span style={{ flexShrink: 0, fontSize: '12px', padding: '3px 10px', borderRadius: '999px', border: '1px solid var(--border)', color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>
            {statusLabel[post.status] ?? '[비공개]'}
            {publishDate && <span style={{ display: 'block', fontSize: '10px', marginTop: '2px' }}>{publishDate}</span>}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-sub)', marginBottom: '24px', flexWrap: 'wrap' }}>
          <span>{post.authorName}</span>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
          {post.tags?.map((tag: string) => (
            <span key={tag} style={{ color: 'var(--tag)', fontSize: '11px' }}>#{tag}</span>
          ))}
        </div>

        {isVisible ? (
  <>
    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'var(--text)', fontSize: '15px' }}>
      {post.content}
    </div>

    {/* 리액션 바 */}
    <ReactionBar
      postId={id}
      reactions={post.reactions ?? {}}
      currentUserId={user?.id ?? null}
    />
  </>
) : (
  <SpoilerMask status={post.status} publishAt={post.publishAt} isLoggedIn={!!user} />
)}

        {isEditable && (
          <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
            <a href={`/posts/${id}/edit`} style={{
              fontSize: '13px',
              padding: '6px 14px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-sub)',
            }}>
              게시글 수정
            </a>
            <DeleteButton id={post.id} sha={post.sha} />
          </div>
        )}

        {/* 댓글 — 내용을 볼 수 있는 유저만 */}
        {isVisible && (
          <CommentSection
            postId={id}
            comments={comments}
            currentUser={user ? { id: user.id, name: user.name, role: (user as any).role } : null}
          />
        )}
      </div>
    </main>
  );
}