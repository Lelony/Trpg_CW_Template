# TRPG 스포일러 방지 게시판

> TRPG 스포일러 방지 게시판 — Next.js + GitHub API 기반, DB 없이 운영 가능한 소규모 커뮤니티 게시판입니다.

> 본래 개인 사용용으로 만들어진 프로젝트로, 사용은 자유이나 문의는 받지 않습니다! 개선 사항이 필요할 경우 클론 및 포크로 가져가서 수정해 사용해주시면 됩니다.

> 원본 및 수정본을 재배포하거나 상업적으로 이용하는 것을 금합니다.

> 상시 업데이트가 진행되는 레포지토리로, 해당 레포지토리를 그대로 vercel에 배포하는 것은 추천드리지 않습니다. 복사본으로 가져가 사용해주세요.

---

## 이 프로젝트에 대해

이 프로젝트는 원래 **시노비가미** TRPG 캠페인을 위해 만들어졌지만, 어떤 TRPG 시스템이나 소규모 커뮤니티에도 자유롭게 활용할 수 있도록 설계되어 있어요.

사이트 이름, 설명, 색상 테마 등 대부분의 요소를 **관리자 패널에서 코드 수정 없이** 변경할 수 있으니, 본인의 캠페인이나 모임에 맞게 마음껏 커스터마이징해서 사용하세요!

> 예시: 던전앤드래곤 원정대 일지 / 클트오브비서스 세션 기록 / 어둠의 심연 탐험대 게시판 ...

---

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
  - [방법 A — 코드 없이 브라우저에서 바로 배포](#방법-a--코드-없이-브라우저에서-바로-배포-추천)
  - [방법 B — 로컬 개발 환경에서 배포](#방법-b--로컬-개발-환경에서-배포)
- [초기 데이터 파일 생성](#초기-데이터-파일-생성)
- [환경변수 목록](#환경변수-목록)
- [관리자 설정 가이드](#관리자-설정-가이드)
- [사용자 안내](#사용자-안내)
- [주의사항](#주의사항)

---

## 주요 기능

- **스포일러 방지** — 비공개 / 전체 공개 / 예약 공개 / 지정 유저 공개 설정
- **권한 시스템** — 관리자 / 중재자 / 일반 유저 3단계
- **댓글 · 답글** — 열람 권한이 있는 유저만 작성 가능, @멘션 지원
- **댓글 알림** — 내 게시글 댓글 / 내 댓글 답글 / @멘션 알림
- **게시글 검색 / 필터** — 제목 검색, 태그별 · 작성자별 필터, 30개 단위 페이지네이션
- **테마 전환** — 다크 모드 / 라이트 모드 (관리자가 색상 커스터마이징 가능)
- **사이트 설정** — 관리자 패널에서 사이트 이름, 설명, 색상 등 코드 없이 변경 가능

---

## 기술 스택

| 항목 | 내용 |
|---|---|
| 프레임워크 | Next.js 14 (App Router) |
| 스타일 | Tailwind CSS v4 + CSS 변수 |
| 인증 | NextAuth.js v5 (Credentials) |
| 저장소 | GitHub API (Octokit) |
| 배포 | Vercel |
| 유효성 검사 | Zod |

---

## 시작하기

이 프로젝트는 **GitHub 레포지토리가 2개** 필요합니다.

| 레포 | 용도 | 공개 여부 |
|---|---|---|
| 코드 레포 | Next.js 소스코드 | Public 또는 Private |
| 데이터 레포 | 게시글, 유저, 설정 JSON 저장 | **반드시 Private** |

> ⚠️ 데이터 레포는 반드시 **Private**으로 설정하세요.  
> 유저 비밀번호 해시, 게시글 내용 등 민감한 정보가 저장됩니다.

---

### 방법 A — 코드 없이 브라우저에서 바로 배포 (추천)

터미널이나 개발 환경 없이 GitHub와 Vercel 웹사이트만으로 배포할 수 있어요.

#### 1단계 — 코드 레포 복사

1. 이 레포 상단의 **Use this template** 버튼 클릭
2. **Create a new repository** 선택
3. 레포 이름 입력 (예: `my-trpg-board`)
4. Public 또는 Private 선택 후 **Create repository** 클릭

#### 2단계 — 데이터 레포 생성

1. GitHub 우측 상단 **+** → **New repository** 클릭
2. 레포 이름 입력 (예: `my-trpg-board-data`)
3. **Private** 선택 (필수)
4. **Create repository** 클릭

#### 3단계 — 데이터 레포에 초기 파일 생성

아래 [초기 데이터 파일 생성](#초기-데이터-파일-생성) 섹션을 참고하여 GitHub 웹에서 직접 파일을 만들어주세요.

#### 4단계 — GitHub PAT 발급

1. GitHub → 우측 프로필 → **Settings**
2. 좌측 하단 **Developer settings**
3. **Personal access tokens → Tokens (classic)**
4. **Generate new token (classic)** 클릭
5. `repo` 스코프 체크 후 생성
6. 발급된 토큰 복사해두기 (`ghp_...`)

#### 5단계 — Vercel에서 배포

1. [vercel.com](https://vercel.com) 접속 후 GitHub 계정으로 로그인
2. **Add New → Project** 클릭
3. 1단계에서 만든 **코드 레포** 선택 후 **Import**
4. **Environment Variables** 섹션에서 아래 항목 추가

| 변수명 | 값 |
|---|---|
| `GITHUB_PAT` | 4단계에서 복사한 토큰 |
| `GITHUB_REPO_OWNER` | 본인 GitHub 아이디 |
| `GITHUB_REPO_NAME` | 데이터 레포 이름 (예: `my-trpg-board-data`) |
| `NEXTAUTH_SECRET` | 랜덤 문자열 32자 이상 (아무 문자나 길게 입력) |
| `NEXTAUTH_URL` | 잠시 후 확인할 배포 URL (일단 `https://temp.vercel.app` 입력) |

5. **Deploy** 클릭
6. 배포 완료 후 생성된 URL 확인 (예: `https://my-trpg-board.vercel.app`)
7. Vercel → **Settings → Environment Variables** → `NEXTAUTH_URL` 값을 실제 배포 URL로 수정
8. **Deployments → 최근 배포 → 우측 점 세 개 → Redeploy**

배포 완료! 이제 사이트에 접속할 수 있어요.

---

### 방법 B — 로컬 개발 환경에서 배포

코드를 직접 수정하거나 로컬에서 테스트하고 싶을 때 사용해요.

#### 1단계 — 레포 준비

위 방법 A의 1~4단계와 동일하게 진행하세요.  
그 다음 아래 명령어로 로컬에 clone해주세요.

```bash
git clone https://github.com/본인계정/코드레포이름.git
cd 코드레포이름
```

#### 2단계 — 패키지 설치

Node.js 18 이상이 필요합니다.

```bash
npm install
```

#### 3단계 — 환경변수 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하세요.

```env
GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO_OWNER=본인_GitHub_아이디
GITHUB_REPO_NAME=데이터_레포_이름
NEXTAUTH_SECRET=랜덤_문자열_32자_이상
NEXTAUTH_URL=http://localhost:3000
```

> `NEXTAUTH_SECRET`은 아래 명령어로 생성할 수 있어요.
> ```bash
> openssl rand -base64 32
> ```

#### 4단계 — 로컬 실행

```bash
npm run dev
```

`http://localhost:3000` 에서 확인하세요.

#### 5단계 — Vercel 배포

```bash
npm install -g vercel
vercel
```

배포 후 Vercel 대시보드 → **Settings → Environment Variables**에 `.env.local`과 동일한 항목을 등록하고 **Redeploy**해주세요. 이때 `NEXTAUTH_URL`은 실제 배포 URL로 변경하세요.

---

## 초기 데이터 파일 생성

데이터 레포에 아래 파일들을 생성해주세요.  
GitHub 웹에서 **Add file → Create new file**로 만들 수 있어요.

### `data/users.json`

관리자 계정을 추가합니다.

```json
[
  {
    "id": "admin",
    "name": "GM",
    "password": "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    "role": "admin"
  }
]
```

> 위 해시의 원본 비밀번호는 `password`입니다. 로그인 후 반드시 변경하세요.

### `data/settings.json`

사이트 설정 파일입니다. 사이트 이름과 색상은 나중에 관리자 패널에서도 변경할 수 있어요.

```json
{
  "siteName": "우리 파티 게시판",
  "siteDescription": "TRPG 스포일러 방지 게시판",
  "shinobiModeName": "다크 모드",
  "snsModeName": "라이트 모드",
  "shinobi": {
    "bg": "#0c0a09",
    "bgCard": "#111110",
    "bgHeader": "#0c0a09",
    "border": "#2a2420",
    "borderHover": "#8b1a1a",
    "text": "#e8dfd0",
    "textSub": "#8c7e6e",
    "textMuted": "#4a3f35",
    "accent": "#c0392b",
    "accentText": "#f5e6d3",
    "tag": "#8b1a1a"
  },
  "sns": {
    "bg": "#f8fafc",
    "bgCard": "#ffffff",
    "bgHeader": "#ffffff",
    "border": "#e2e8f0",
    "borderHover": "#6366f1",
    "text": "#0f172a",
    "textSub": "#64748b",
    "textMuted": "#94a3b8",
    "accent": "#6366f1",
    "accentText": "#ffffff",
    "tag": "#6366f1"
  }
}
```

### `content/posts/.gitkeep`

빈 파일을 생성해 폴더를 유지합니다.  
파일명에 `content/posts/.gitkeep` 을 입력하면 폴더가 자동 생성돼요. 내용은 비워두세요.

---

## 환경변수 목록

| 변수명 | 설명 | 예시 |
|---|---|---|
| `GITHUB_PAT` | GitHub Personal Access Token (repo 스코프) | `ghp_xxx...` |
| `GITHUB_REPO_OWNER` | 데이터 레포 소유자 GitHub 아이디 | `your-username` |
| `GITHUB_REPO_NAME` | 데이터 레포 이름 | `my-trpg-board-data` |
| `NEXTAUTH_SECRET` | JWT 서명용 비밀키 (32자 이상) | `openssl rand -base64 32` 결과 |
| `NEXTAUTH_URL` | 배포된 앱의 URL | `https://my-trpg-board.vercel.app` |

> ⚠️ `.env.local` 파일은 절대 GitHub에 올리지 마세요. `.gitignore`에 기본 포함되어 있습니다.

---

## 관리자 설정 가이드

배포 후 관리자 계정으로 로그인하면 헤더에 **관리자** 링크가 표시됩니다.

### 권한 체계

| 권한 | 모든 게시글 열람 | 계정 관리 | 게시글 작성 | 댓글 전체 삭제 |
|---|---|---|---|---|
| admin (관리자) | ✅ | ✅ | ✅ | ✅ |
| moderator (중재자) | ✅ | ❌ | ✅ | ❌ |
| user (일반) | ❌ | ❌ | ✅ | ❌ |

### 유저 관리

- 관리자 패널 → **새 유저 추가**에서 계정을 생성합니다.
- 초기 비밀번호는 `0000`으로 설정하고 유저에게 안내하세요.
- 유저는 마이페이지에서 직접 비밀번호를 변경할 수 있습니다.

### 게시글 공개 설정

| 설정 | 설명 |
|---|---|
| 비공개 `秘` | 작성자 본인과 관리자 · 중재자만 열람 |
| 전체 공개 `公` | 로그인한 모든 유저 열람 가능 |
| 예약 공개 `時` | 지정한 날짜 · 시각 이후 자동 전체 공개 |
| 지정 유저 공개 `選` | 선택한 유저만 열람 가능 (관리자 · 중재자는 항상 열람 가능) |

### 사이트 커스터마이징

관리자 패널 하단 **사이트 설정**에서 코드 수정 없이 변경할 수 있어요.

- **사이트 이름 / 설명** — 본인 캠페인이나 파티 이름으로 바꾸세요
- **테마 이름** — 다크 모드 / 라이트 모드 버튼 이름을 원하는 대로 변경
- **색상 커스터마이징** — 각 테마의 배경색, 포인트 색 등을 색상 피커로 직접 변경

설정 저장 후 페이지를 새로고침하면 반영됩니다.

---

## 사용자 안내

- 계정은 관리자(GM)에게 발급받아야 합니다.
- 초기 비밀번호는 관리자에게 안내받은 후 마이페이지에서 반드시 변경하세요.
- 로그인 후 **본인 이름 클릭 → 마이페이지**에서 비밀번호를 변경할 수 있습니다.
- 내 게시글에 댓글이 달리거나, 내 댓글에 답글이 달리거나, 답글에서 @멘션되면 헤더 벨 아이콘에 알림이 표시됩니다.
- 자세한 사용 방법은 사이트 내 **사용 안내** 페이지를 참고하세요.

---

## 주의사항

- 이 프로젝트는 **소규모 운영**을 전제로 합니다. 게시글 수가 많아지면 GitHub API 호출 속도가 느려질 수 있습니다.
- GitHub API는 인증된 요청 기준 **시간당 5,000회** 제한이 있습니다.
- 데이터 레포는 반드시 **Private**으로 유지하세요.
- `GITHUB_PAT`는 절대 외부에 노출하지 마세요.
- 동시에 여러 명이 같은 게시글에 댓글을 작성할 경우 드물게 충돌이 발생할 수 있습니다. (SHA 기반 낙관적 동시성 제어로 최소화되어 있습니다.)

---

## 라이선스

이 프로젝트는 개인 및 소규모 커뮤니티 용도로 자유롭게 사용할 수 있습니다.  
원본 레포지토리의 코드를 그대로 판매하거나 상업적으로 이용하는 것은 허용되지 않습니다.
