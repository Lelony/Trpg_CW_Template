// app/loading.tsx
export default function Loading() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '2px solid var(--border)',
        borderTop: '2px solid var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', letterSpacing: 'var(--letter-spacing)' }}>
        불러오는 중...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}