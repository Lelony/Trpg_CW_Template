// app/mypage/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import MyPasswordForm from '@/components/MyPasswordForm';

export const dynamic = 'force-dynamic';

export default async function MyPage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect('/login');

  const roleLabel: Record<string, string> = {
    admin:     '관리자',
    moderator: '중재자',
    user:      '일반',
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '24px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '24px' }}>
        내 계정
      </h1>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        {[
          { label: '아이디', value: user.id },
          { label: '이름',   value: user.name },
          { label: '권한',   value: roleLabel[user.role] ?? user.role },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-sub)' }}>{label}</span>
            <span style={{ fontSize: '14px', color: 'var(--text)' }}>{value}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
        비밀번호 변경
      </h2>
      <MyPasswordForm />
    </main>
  );
}