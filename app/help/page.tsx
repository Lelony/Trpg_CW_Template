// app/help/page.tsx

export default function HelpPage() {
  const sections = [
    {
      title: '로그인 방법',
      content: [
  {
    step: '01',
    heading: '계정 발급',
    desc: '이 게시판은 관리자가 직접 계정을 발급합니다. 계정이 없다면 GM에게 문의하세요. 초기 비밀번호는 0000입니다.',
  },
  {
    step: '02',
    heading: '비밀번호 변경 필수',
    desc: '처음 로그인 후 반드시 마이페이지에서 비밀번호를 변경해주세요. 우측 상단 본인 이름 클릭 → 마이페이지 → 비밀번호 변경.',
  },
  {
    step: '03',
    heading: '로그인',
    desc: '우측 상단 로그인 버튼을 클릭하여 발급받은 아이디와 비밀번호를 입력합니다.',
  },
],
    },
    {
      title: '게시글 읽기',
      content: [
        {
          step: '01',
          heading: '목록 조회',
          desc: '로그인하지 않아도 게시글 제목 목록은 볼 수 있습니다.',
        },
        {
          step: '02',
          heading: '내용 조회',
          desc: '게시글 내용은 로그인한 경우에만 읽을 수 있으며, 비공개 게시글은 작성자 본인과 관리자만 열람 가능합니다.',
        },
        {
          step: '03',
          heading: '예약 공개 게시글',
          desc: '예약 공개로 설정된 게시글은 설정된 날짜와 시각이 지난 후 자동으로 전체 공개됩니다.',
        },
      ],
    },
    {
      title: '게시글 쓰기',
      content: [
        {
          step: '01',
          heading: '작성',
          desc: '로그인 후 우측 상단 게시글 작성 버튼을 눌러 제목과 내용을 입력합니다.',
        },
        {
          step: '02',
          heading: '태그',
          desc: '태그를 쉼표로 구분하여 입력하면 목록에서 분류가 쉬워집니다. 예: 1세션, 전투, 보스',
        },
        {
          step: '03',
          heading: '수정 및 삭제',
          desc: '본인이 작성한 게시글은 상세 페이지 하단에서 수정하거나 삭제할 수 있습니다.',
        },
      ],
    },
    {
      title: '공개 설정',
      content: [
        {
          step: '秘',
          heading: '비공개',
          desc: '작성자 본인과 관리자만 내용을 볼 수 있습니다. 다른 플레이어의 스포일러를 방지할 때 사용하세요.',
        },
        {
          step: '公',
          heading: '전체 공개',
          desc: '로그인한 모든 유저가 내용을 볼 수 있습니다. 공유해도 괜찮은 내용일 때 사용하세요.',
        },
        {
          step: '時',
          heading: '예약 공개',
          desc: '지정한 날짜와 시각이 지나면 자동으로 전체 공개됩니다. 세션 종료 후 일정 시간이 지난 뒤 공개하고 싶을 때 사용하세요.',
        },
        {
  step: '選',
  heading: '지정 유저 공개',
  desc: '선택한 유저에게만 내용이 공개됩니다. GM과 중재자는 조건에 관계없이 항상 열람 가능합니다.',
},
      ],
    },
  ];

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '40px 24px', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <a href="/" style={{ fontSize: '13px', color: 'var(--text-sub)' }}>← 목록으로</a>
      </div>

      <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '26px', fontWeight: '700', color: 'var(--accent)', letterSpacing: 'var(--letter-spacing)', marginBottom: '8px' }}>
        사용 안내
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '48px', lineHeight: 1.8 }}>
        닌-쟈 일기장은 TRPG 시노비가미 플레이어들을 위한 스포일러 방지 게시판입니다.<br />
        다른 플레이어의 세션 경험을 보호하기 위해 공개 설정을 꼭 확인해주세요.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {sections.map((section) => (
          <section key={section.title}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '3px', height: '20px', backgroundColor: 'var(--accent)', borderRadius: '2px', flexShrink: 0 }} />
              <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0, letterSpacing: 'var(--letter-spacing)' }}>
                {section.title}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {section.content.map((item) => (
                <div key={item.step} style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: '15px',
                    fontWeight: '700',
                    color: 'var(--accent)',
                    flexShrink: 0,
                    minWidth: '24px',
                    lineHeight: 1.6,
                  }}>
                    {item.step}
                  </span>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)', margin: '0 0 4px', fontFamily: 'var(--font-title)', letterSpacing: 'var(--letter-spacing)' }}>
                      {item.heading}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-sub)', margin: 0, lineHeight: 1.8 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div style={{ marginTop: '56px', padding: '20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8, margin: 0 }}>
          문의사항이 있으면 GM에게 연락하거나 관리자 계정으로 로그인하여 관리자 패널을 이용하세요.
        </p>
      </div>
    </main>
  );
}