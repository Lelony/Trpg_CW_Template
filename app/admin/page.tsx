// app/admin/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUsers, getSettings } from '@/lib/github';
import UserTable from '@/components/admin/UserTable';
import AddUserForm from '@/components/admin/AddUserForm';
import SettingsForm from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/');

  const users    = await getUsers();
  const settings = await getSettings();
  const safeUsers = users.map(({ password, ...rest }: any) => rest);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '24px', maxWidth: '768px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '40px', fontFamily: 'var(--font-title)' }}>
        관리자 패널
      </h1>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
          유저 목록
        </h2>
        <UserTable users={safeUsers} />
      </section>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
          새 유저 추가
        </h2>
        <AddUserForm />
      </section>

      <section>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
          사이트 설정
        </h2>
        {settings ? (
          <SettingsForm settings={settings} />
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            settings.json을 찾을 수 없습니다. GitHub 레포에 data/settings.json을 먼저 생성해주세요.
          </p>
        )}
      </section>
    </main>
  );
}