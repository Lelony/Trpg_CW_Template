// app/posts/[id]/edit/page.tsx
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getPost, getUsers } from '@/lib/github';
import { canEditPost } from '@/lib/permissions';
import EditForm from '@/components/EditForm';

export const dynamic = 'force-dynamic';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user as any ?? null;

  if (!user) redirect('/login');

  const post = await getPost(id);
  if (!post) notFound();
  if (!canEditPost(post, user)) redirect(`/posts/${id}`);

  const allUsers = await getUsers();
const users = allUsers
  .filter((u: any) => u.id !== user.id && (u.role === 'user' || u.role === 'moderator'))
  .map((u: any) => ({ id: u.id, name: u.name }));

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '24px', maxWidth: '768px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <a href={`/posts/${id}`} style={{ fontSize: '13px', color: 'var(--text-sub)' }}>← 돌아가기</a>
      </div>
      <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '24px', fontFamily: 'var(--font-title)' }}>
        게시글 수정
      </h1>
      <EditForm post={post} users={users} />
    </main>
  );
}