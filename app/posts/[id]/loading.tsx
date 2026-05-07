// app/posts/[id]/loading.tsx
export default function PostLoading() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '24px', maxWidth: '768px', margin: '0 auto' }}>
      <div style={{ width: '60px', height: '14px', backgroundColor: 'var(--border)', borderRadius: '4px', marginBottom: '20px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ width: '60%', height: '24px', backgroundColor: 'var(--border)', borderRadius: '4px', marginBottom: '16px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: '30%', height: '14px', backgroundColor: 'var(--border)', borderRadius: '4px', marginBottom: '24px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[100, 90, 75].map((w) => (
            <div key={w} style={{ width: `${w}%`, height: '14px', backgroundColor: 'var(--border)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </main>
  );
}