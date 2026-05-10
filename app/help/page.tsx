// app/help/page.tsx

export default function HelpPage() {
  const sections = [
    {
      title: '로그인 방법',
      content: [
        {
          step: '01',
          heading: '계정 발급',
          desc: '이 게시판은 관리자가 직접 계정을 발급합니다. 계정이 없다면 관리자에게 문의하세요. 초기 비밀번호는 0000입니다.',
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
          desc: '로그인하지 않아도 게시글 제목 목록은 볼 수 있습니다. 열람 가능한 글과 잠긴 글은 색상과 뱃지로 구분됩니다.',
        },
        {
          step: '02',
          heading: '내용 조회',
          desc: '게시글 내용은 로그인한 경우에만 읽을 수 있으며, 비공개 게시글은 작성자 본인과 관리자 · 중재자만 열람 가능합니다.',
        },
        {
          step: '03',
          heading: '검색 및 필터',
          desc: '목록 상단에서 제목으로 검색하거나 태그 · 작성자별로 필터링할 수 있습니다. 게시글은 30개 단위로 나뉩니다.',
        },
        {
          step: '04',
          heading: '북마크',
          desc: '게시글 상세 페이지에서 ☆ 버튼으로 북마크할 수 있습니다. 지금은 못 보는 글을 찜해뒀다가 나중에 몰아볼 때 유용해요. 헤더의 북마크 메뉴에서 모아볼 수 있습니다.',
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
          desc: '태그를 쉼표로 구분하여 입력하면 목록에서 필터링이 쉬워집니다. # 기호는 자동으로 제거됩니다.',
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
          desc: '작성자 본인과 관리자 · 중재자만 내용을 볼 수 있습니다.',
        },
        {
          step: '公',
          heading: '전체 공개',
          desc: '로그인한 모든 유저가 내용을 볼 수 있습니다.',
        },
        {
          step: '時',
          heading: '예약 공개',
          desc: '지정한 날짜와 시각이 지나면 자동으로 전체 공개됩니다.',
        },
        {
          step: '選',
          heading: '지정 유저 공개',
          desc: '선택한 유저에게만 내용이 공개됩니다. 관리자 · 중재자는 조건에 관계없이 항상 열람 가능합니다.',
        },
      ],
    },
    {
      title: '댓글 · 답글',
      content: [
        {
          step: '01',
          heading: '댓글 작성',
          desc: '게시글 내용을 열람할 수 있는 유저만 댓글을 작성할 수 있습니다.',
        },
        {
          step: '02',
          heading: '답글',
          desc: '댓글이나 답글의 답글 버튼을 눌러 답글을 달 수 있습니다. 특정 사람에게 답할 때는 @이름이 자동으로 붙어요.',
        },
        {
          step: '03',
          heading: '수정 및 삭제',
          desc: '본인이 작성한 댓글과 답글은 수정하거나 삭제할 수 있습니다. 수정된 댓글에는 (수정됨) 표시가 나타납니다.',
        },
        {
          step: '04',
          heading: '리액션',
          desc: '게시글과 댓글 · 답글 각각에 이모지 리액션을 달 수 있습니다. 1인 1리액션이며 다시 누르면 취소됩니다.',
        },
      ],
    },
    {
      title: '알림',
      content: [
        {
          step: '01',
          heading: '댓글 알림',
          desc: '내 게시글에 댓글이 달리면 헤더 벨 아이콘에 알림이 표시됩니다.',
        },
        {
          step: '02',
          heading: '답글 알림',
          desc: '내 댓글에 답글이 달리면 알림이 표시됩니다.',
        },
        {
          step: '03',
          heading: '@멘션 알림',
          desc: '답글에서 @내이름으로 멘션되면 알림이 표시됩니다.',
        },
        {
          step: '04',
          heading: '알림 확인',
          desc: '알림을 클릭하면 해당 게시글로 이동하고 읽음 처리됩니다. 모두 읽음 버튼으로 한번에 처리할 수 있습니다.',
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
        처음 방문하셨나요? 아래 안내를 읽고 시작해보세요.
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {section.content.map((item) => (
                <div key={item.step} style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '14px 18px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: '14px',
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
          문의사항이 있으면 관리자에게 연락하거나 관리자 계정으로 로그인하여 관리자 패널을 이용하세요.
        </p>
      </div>
    </main>
  );
}