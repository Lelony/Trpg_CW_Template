// app/not-found.tsx
export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
      <p style={{ fontSize: '48px', marginBottom: '16px' }}>?</p>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '8px' }}>
        찾을 수 없습니다
      </h1>
      <p style={{ color: 'var(--text-sub)', marginBottom: '24px' }}>
        찾으시는 게시글이 존재하지 않거나 삭제되었습니다.
      </p>
      <a href="/" style={{
        padding: '10px 24px',
        backgroundColor: 'var(--accent)',
        color: 'var(--accent-text)',
        fontWeight: '600',
        borderRadius: '8px',
        fontSize: '14px',
      }}>
        목록으로 돌아가기
      </a>
    </main>
  );
}