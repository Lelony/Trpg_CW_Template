// app/write/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUsers } from '@/lib/github';
import PostForm from '@/components/PostForm';

export const dynamic = 'force-dynamic';

export default async function WritePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const allUsers = await getUsers();
  const currentUser = session.user as any;

  // 본인 제외한 일반 유저 목록 (admin/moderator는 자동 포함이라 제외)
const users = allUsers
  .filter((u: any) => u.id !== currentUser.id && (u.role === 'user' || u.role === 'moderator'))
  .map((u: any) => ({ id: u.id, name: u.name }));

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '24px', maxWidth: '768px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <a href="/" style={{ fontSize: '13px', color: 'var(--text-sub)' }}>← 목록으로</a>
      </div>
      <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '24px', fontFamily: 'var(--font-title)' }}>
        새 게시글 작성
      </h1>
      <PostForm users={users} />
    </main>
  );
}