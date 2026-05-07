// components/admin/SettingsForm.tsx
'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { updateSettings } from '@/app/actions/settings';

const inputStyle = {
  backgroundColor: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '14px',
  color: 'var(--text)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const,
};

const labelStyle = {
  fontSize: '12px',
  color: 'var(--text-sub)',
  marginBottom: '4px',
  display: 'block',
};

const colorFields = [
  { key: 'bg',          label: '배경색' },
  { key: 'bgCard',      label: '카드 배경색' },
  { key: 'bgHeader',    label: '헤더 배경색' },
  { key: 'border',      label: '테두리 색' },
  { key: 'borderHover', label: '테두리 호버 색' },
  { key: 'text',        label: '본문 텍스트 색' },
  { key: 'textSub',     label: '보조 텍스트 색' },
  { key: 'textMuted',   label: '흐린 텍스트 색' },
  { key: 'accent',      label: '포인트 색' },
  { key: 'accentText',  label: '포인트 위 텍스트 색' },
  { key: 'tag',         label: '태그 색' },
];

function ColorField({ prefix, fieldKey, label, defaultValue }: {
  prefix: string;
  fieldKey: string;
  label: string;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input
          type="color"
          name={`${prefix}_${fieldKey}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ width: '36px', height: '36px', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', padding: '2px', backgroundColor: 'var(--bg)' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }}
        />
      </div>
    </div>
  );
}

export default function SettingsForm({ settings }: { settings: any }) {
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null); setSuccess(null);
    startTransition(async () => {
      const res = await updateSettings(fd);
      if (res?.error) setError(res.error);
      else setSuccess('설정이 저장되었습니다. 페이지를 새로고침하면 적용됩니다.');
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {error   && <p style={{ fontSize: '13px', color: '#f87171', backgroundColor: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '12px' }}>{error}</p>}
      {success && <p style={{ fontSize: '13px', color: '#4ade80', backgroundColor: '#052e16', border: '1px solid #14532d', borderRadius: '8px', padding: '12px' }}>{success}</p>}

      {/* 기본 정보 */}
      <section>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
          기본 정보
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>사이트 이름</label>
            <input name="siteName" defaultValue={settings.siteName} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>사이트 설명</label>
            <input name="siteDescription" defaultValue={settings.siteDescription} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>시노비 모드 이름</label>
              <input name="shinobiModeName" defaultValue={settings.shinobiModeName} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>SNS 모드 이름</label>
              <input name="snsModeName" defaultValue={settings.snsModeName} style={inputStyle} />
            </div>
          </div>
        </div>
      </section>

      {/* 시노비 테마 색상 */}
      <section>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
          시노비 모드 색상
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {colorFields.map(({ key, label }) => (
            <ColorField
              key={`shinobi_${key}`}
              prefix="shinobi"
              fieldKey={key}
              label={label}
              defaultValue={settings.shinobi[key]}
            />
          ))}
        </div>
      </section>

      {/* SNS 테마 색상 */}
      <section>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
          SNS 모드 색상
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {colorFields.map(({ key, label }) => (
            <ColorField
              key={`sns_${key}`}
              prefix="sns"
              fieldKey={key}
              label={label}
              defaultValue={settings.sns[key]}
            />
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={pending}
        style={{
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-text)',
          fontWeight: '600',
          fontSize: '15px',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          cursor: pending ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? '저장 중...' : '설정 저장'}
      </button>
    </form>
  );
}