# 노무사 홈페이지 스타터 (nomusa-homepage-starter)

> 코딩 경험 없이도 **3시간 안에** 내 이름 홈페이지를 띄우고, 상담 신청을 DB에 쌓고, 내 메일로 알림을 받고, 구글·네이버·빙에 등록하는 것을 목표로 만든 스타터입니다.
> 2026-09-06 AEO·GEO 실전 강의(박실로 공인노무사) 실습 자료. 프레임워크·빌드 도구 없이 HTML 파일 몇 개와 서버 함수 2개로 끝납니다.

## 무엇이 들어 있나

| 파일 | 역할 |
|---|---|
| `index.html` | 홈. 소개·전문분야·FAQ·상담 폼. 머리에 JSON-LD(Person·LegalService·WebSite·FAQPage) 포함 |
| `posts/` | 글 목록과 글 템플릿 1편(질문형 제목 → 결론 먼저 → 표 → 절차 → FAQ → 작성자 블록) |
| `api/contact.js` | 상담 폼 접수 → Supabase 저장 → Resend 메일 알림 (Vercel 서버리스 함수) |
| `api/health.js` | 환경변수가 들어갔는지 확인하는 점검 주소 `/api/health` |
| `supabase.sql` | 상담 테이블 생성 SQL (RLS 켜짐: 바깥에서 못 읽음) |
| `robots.txt` | 검색·AI 봇 허용 목록 + 사이트맵 위치 |
| `sitemap.xml` | 검색엔진에 제출하는 페이지 목록 |
| `llms.txt` | AI용 요약(비용 0, 성과 지표는 아님) |
| `indexnow.sh` | 새 글 올린 뒤 빙·네이버에 알리는 스크립트 |
| `setup.sh` / `setup.ps1` | `YOUR-DOMAIN.vercel.app`을 내 주소로 한 번에 바꾸는 스크립트 (맥·리눅스 / 윈도우 PowerShell) |

## 순서 (강의 진행 순서와 같음)

### 1. 복사하기
1. 이 저장소 오른쪽 위 **Use this template → Create a new repository**.
2. 저장소 이름은 `nomusa-이름` 처럼 짧게 (예: `nomusa-hong`). Public.

### 2. Vercel에 올리기
1. [vercel.com](https://vercel.com) → GitHub 계정으로 가입 → **Add New… → Project → Import** 에서 방금 만든 저장소 선택.
2. Project Name이 곧 주소가 됩니다. `nomusa-hong` 이면 `https://nomusa-hong.vercel.app`.
3. **Deploy**. 1~2분 뒤 주소가 나옵니다. 열어 보세요.

### 3. 내 정보 넣기 + 주소 바꾸기
- 방법 A (터미널 있으면): 맥 `bash setup.sh nomusa-hong.vercel.app` / 윈도우 PowerShell `.\setup.ps1 nomusa-hong.vercel.app` → 커밋·푸시.
- 방법 B (브라우저만): GitHub 저장소에서 키보드 `.` 을 누르면 웹 편집기(github.dev)가 열립니다. `Ctrl+Shift+H`(맥 `Cmd+Shift+H`) → 찾기 `YOUR-DOMAIN.vercel.app` → 바꾸기 `nomusa-hong.vercel.app` → 전체 바꾸기 → 왼쪽 Source Control에서 메시지 적고 **Commit & Push**.
- 그다음 `index.html` 맨 위 **★ 여기만 바꾸세요** 블록의 [대괄호] 값을 본인 정보로 바꿉니다(이름·자격·소속·지역·전문분야·전화·주소·sameAs).
- 커밋하면 Vercel이 자동으로 다시 배포합니다(30초~1분).

### 4. 상담 폼 살리기
1. [supabase.com](https://supabase.com) → New project(무료) → 왼쪽 **SQL Editor** → `supabase.sql` 내용 붙여 넣고 **Run**.
2. Supabase → Project Settings → **API Keys**: `Project URL` 과 **Secret key**(`sb_secret_…`, 구 service_role) 복사.
3. [resend.com](https://resend.com) → API Keys → 키 생성(`re_…`). 도메인이 없으면 Resend 테스트 발신 주소로 **본인 계정 메일에만** 발송 테스트가 됩니다. 도메인이 있으면 Domains에서 DNS 레코드를 추가해 인증 후 `noreply@내도메인` 사용.
4. Vercel → 프로젝트 → **Settings → Environment Variables** 에 5개 입력(`.env.example` 참고): `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `NOTIFY_TO`, `NOTIFY_FROM`.
5. Deployments → 최신 배포 **⋯ → Redeploy**. 끝나면 `내주소/api/health` 열어 전부 `true`인지 확인.
6. 홈 상담 폼에 테스트 제출 → Supabase **Table Editor → consultations** 에 행이 생기고, 메일이 옵니다.

### 5. 검색엔진에 등록하기 (구글 → 빙 → 네이버 순서)
1. **Google Search Console** → 속성 추가 → **URL 접두어** → `https://nomusa-hong.vercel.app` → 인증 방법 **HTML 태그** → 준 한 줄을 `index.html`의 `google-site-verification` 주석 자리에 붙이고 커밋 → 확인. 그다음 **Sitemaps** 에 `sitemap.xml` 제출, **URL 검사**에서 홈 주소 → **색인 생성 요청**.
2. **Bing Webmaster Tools** → 로그인 → **Import from Google Search Console** 한 번 클릭. (IndexNow 키는 선택: 32자 키를 만들어 `<키>.txt` 파일을 저장소 루트에 올리고 `indexnow.sh`에 채움)
3. **네이버 서치어드바이저** → 웹마스터 도구 → 사이트 등록 → 소유확인 **HTML 태그** → `naver-site-verification` 주석 자리에 붙이고 커밋 → 확인. **요청 → 사이트맵 제출** `https://…/sitemap.xml`, **웹 페이지 수집** 에 홈 주소 요청(하루 50개 한도).

### 6. 원격 사후관리 (사무실에 없어도 되는 것들)
- 상담 확인: 폰에서 Supabase 앱/웹 → Table Editor. 메일 알림은 이미 옴.
- 글 추가: GitHub 앱 또는 웹에서 `posts/unpaid-wages-first-steps.html` 복사 → 새 파일 → `posts/index.html`과 `sitemap.xml`에 한 줄씩 추가 → 커밋 → 자동 배포 → `indexnow.sh` 실행(빙·네이버) → 구글은 서치콘솔에서 색인 요청.
- 월 1회 15분: 서치콘솔 색인 수·오류, 빙 SEO 리포트, `/api/health`, robots.txt 200, 상담 테이블 상태 열 정리.

## 윈도우 사용자 메모
- 모든 단계는 브라우저에서 끝나므로 윈도우·맥 차이가 없습니다. 단축키만 `Cmd` → `Ctrl` 로 읽으세요 (github.dev 찾기·바꾸기는 `Ctrl+Shift+H`).
- 터미널을 쓰려면 PowerShell에서 `.\setup.ps1 내주소` (실행 정책 오류 시 `powershell -ExecutionPolicy Bypass -File .\setup.ps1 내주소`).
- `indexnow.sh`는 Git Bash 또는 WSL에서 실행하거나, 같은 내용을 PowerShell `Invoke-RestMethod`로 보내도 됩니다.
- Tailscale은 윈도우 앱이 있습니다. 사무실 윈도우 PC에 밖에서 붙을 때는 Tailscale + 원격 데스크톱(RDP) 또는 Chrome 원격 데스크톱을 씁니다.
- AI에게 시키기: 윈도우에서는 Claude Code·Codex CLI(Windows Terminal/WSL) 또는 ChatGPT의 Codex 클라우드(GitHub 연결, 컴퓨터 꺼도 됨)를 쓰면 됩니다.

## 하지 말 것
- 비밀 키(`sb_secret_…`, `re_…`)를 코드나 커밋에 넣지 않습니다. 오직 Vercel 환경변수.
- 「최고」「1등」「승소 보장」 같은 표현을 쓰지 않습니다(광고 규정·AI 인용 모두에 불리).
- 확인 안 된 판례 번호·조문을 쓰지 않습니다.
- 같은 글을 네이버 블로그 등에 그대로 복붙하지 않습니다(중복 문서).

## 비용
GitHub Free, Vercel Hobby(개인·비상업 용도 조건), Supabase Free(프로젝트 2개, 7일 미사용 시 일시정지 → 대시보드에서 재시작), Resend Free(하루 100통·월 3,000통). 도메인만 연 1~3만 원대(.kr은 국내 등록대행사에서).

## 라이선스
MIT. 마음껏 복사해 쓰세요. 예시 인물 「홍길동」과 「노무법인 예시」는 가상입니다.
